import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
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
const RADII = [1, 2, 3, 4] as const;

const docIdFor = (radius: number, name: string): string =>
  `${radius}_${name.trim().toLowerCase()}`;

type RemoteState = {
  scores: HighScores;
  submit: (radius: number, score: number, name: string) => Promise<HighScoreEntry | null>;
  isRemote: boolean;
  isLoading: boolean;
  error: Error | null;
};

type FirestoreDocData = {
  name: string;
  score: number;
  createdAt?: { toDate: () => Date };
};

const docToEntry = (data: FirestoreDocData): HighScoreEntry => ({
  name: data.name,
  score: data.score,
  date: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
});

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

    setIsLoading(true);
    const received = new Set<number>();

    const unsubscribers = RADII.map((radius) => {
      const q = query(
        collection(db, COLLECTION),
        where("boardRadius", "==", radius),
        orderBy("score", "desc"),
        limit(MAX_ENTRIES_PER_BOARD)
      );
      return onSnapshot(
        q,
        (snap) => {
          const entries = snap.docs.map((d) => docToEntry(d.data() as FirestoreDocData));
          setScores((prev) => ({ ...prev, [radius]: entries }));
          received.add(radius);
          if (received.size === RADII.length) setIsLoading(false);
        },
        (err) => {
          console.error(`[highScores] listener for radius=${radius} failed:`, err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
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
