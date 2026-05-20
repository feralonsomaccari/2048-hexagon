import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDb } from "../services/firebase";
import {
  HighScoreEntry,
  HighScores,
  MAX_ENTRIES_PER_BOARD,
} from "../utils/highScores";

const COLLECTION = "highScores";
const MAX_SCORE_SANITY = 10_000_000;

const docIdFor = (radius: number, name: string): string =>
  `${radius}_${name.trim().toLowerCase()}`;

type RemoteState = {
  scores: HighScores;
  submit: (radius: number, score: number, name: string) => Promise<HighScoreEntry | null>;
  isRemote: boolean;
  isLoading: boolean;
  error: Error | null;
};

const fetchAllBoards = async (): Promise<HighScores> => {
  const db = getDb();
  if (!db) return {};
  const result: HighScores = {};
  for (const radius of [1, 2, 3, 4]) {
    const q = query(
      collection(db, COLLECTION),
      where("boardRadius", "==", radius),
      orderBy("score", "desc"),
      limit(MAX_ENTRIES_PER_BOARD)
    );
    const snap = await getDocs(q);
    result[radius] = snap.docs.map((doc) => {
      const data = doc.data() as { name: string; score: number; createdAt?: { toDate: () => Date } };
      return {
        name: data.name,
        score: data.score,
        date: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
      };
    });
  }
  return result;
};

const useRemoteHighScores = (): RemoteState => {
  const [scores, setScores] = useState<HighScores>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const db = getDb();
  const isRemote = Boolean(db);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("highScores");
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;
    setIsLoading(true);
    fetchAllBoards()
      .then((next) => {
        if (!cancelled) setScores(next);
      })
      .catch((err) => {
        console.error("[highScores] initial fetch failed:", err);
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const submit = useCallback(
    async (radius: number, score: number, name: string): Promise<HighScoreEntry | null> => {
      const trimmedName = name.trim().slice(0, 16);
      if (!trimmedName || score <= 0 || score > MAX_SCORE_SANITY) return null;
      if (!db) return null;

      const entry: HighScoreEntry = {
        name: trimmedName,
        score,
        date: new Date().toISOString(),
      };

      try {
        const ref = doc(db, COLLECTION, docIdFor(radius, trimmedName));
        const existing = await getDoc(ref);
        const existingScore = existing.exists() ? (existing.data().score as number) : -Infinity;

        if (score > existingScore) {
          await setDoc(ref, {
            name: trimmedName,
            score,
            boardRadius: radius,
            createdAt: serverTimestamp(),
          });
        }

        const refreshed = await fetchAllBoards();
        setScores(refreshed);
      } catch (err) {
        console.error("[highScores] write failed:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }

      return entry;
    },
    [db]
  );

  return { scores, submit, isRemote, isLoading, error };
};

export default useRemoteHighScores;
