import { useCallback, useEffect, useState } from "react";
import { getDb, isFirebaseConfigured } from "../services/firebase";
import { FIREBASE_LOGS_ENABLED } from "../config/gameConfig";
import {
  HighScoreEntry,
  HighScores,
  MAX_ENTRIES_PER_BOARD,
} from "../utils/highScores";

const COLLECTION = "highScores";
const MAX_SCORE_SANITY = 10_000_000;
const RADII = [1, 2, 3, 4] as const;

type ScoreBreakdown = {
  undosUsed?: number;
  comboBonus?: number;
  noUndoBonus?: number;
};

type RemoteState = {
  scores: HighScores;
  submit: (
    radius: number,
    score: number,
    name: string,
    breakdown?: ScoreBreakdown
  ) => Promise<HighScoreEntry | null>;
  isRemote: boolean;
  isLoading: boolean;
  error: Error | null;
};

type FirestoreDocData = {
  name: string;
  score: number;
  undosUsed?: number;
  comboBonus?: number;
  noUndoBonus?: number;
  createdAt?: { toDate: () => Date };
};

const docToEntry = (data: FirestoreDocData): HighScoreEntry => ({
  name: data.name,
  score: data.score,
  date: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
  ...(typeof data.undosUsed === "number" ? { undosUsed: data.undosUsed } : {}),
  ...(typeof data.comboBonus === "number" ? { comboBonus: data.comboBonus } : {}),
  ...(typeof data.noUndoBonus === "number" ? { noUndoBonus: data.noUndoBonus } : {}),
});

// Clamp an optional bonus to a safe non-negative integer for storage.
const safeBonus = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;

const useRemoteHighScores = (): RemoteState => {
  const [scores, setScores] = useState<HighScores>({});
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState<Error | null>(null);
  const isRemote = isFirebaseConfigured();

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("highScores");
    }
  }, []);

  useEffect(() => {
    if (!isRemote) return;

    let cancelled = false;
    let unsubscribers: Array<() => void> = [];
    const received = new Set<number>();

    (async () => {
      const [db, { collection, limit, onSnapshot, orderBy, query, where }] =
        await Promise.all([getDb(), import("firebase/firestore")]);
      if (cancelled || !db) return;

      unsubscribers = RADII.map((radius) => {
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
            if (FIREBASE_LOGS_ENABLED) {
              console.error(`[highScores] listener for radius=${radius} failed:`, err);
            }
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsLoading(false);
          }
        );
      });
    })();

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isRemote]);

  const submit = useCallback(
    async (
      radius: number,
      score: number,
      name: string,
      breakdown?: ScoreBreakdown
    ): Promise<HighScoreEntry | null> => {
      const trimmedName = name.trim().slice(0, 16);
      if (!trimmedName || score <= 0 || score > MAX_SCORE_SANITY) return null;
      if (!isRemote) return null;

      const safeUndosUsed = safeBonus(breakdown?.undosUsed);
      const safeComboBonus = safeBonus(breakdown?.comboBonus);
      const safeNoUndoBonus = safeBonus(breakdown?.noUndoBonus);

      const entry: HighScoreEntry = {
        name: trimmedName,
        score,
        date: new Date().toISOString(),
        undosUsed: safeUndosUsed,
        comboBonus: safeComboBonus,
        noUndoBonus: safeNoUndoBonus,
      };

      try {
        const [db, { addDoc, collection, serverTimestamp }] = await Promise.all([
          getDb(),
          import("firebase/firestore"),
        ]);
        if (!db) return null;

        await addDoc(collection(db, COLLECTION), {
          name: trimmedName,
          score,
          boardRadius: radius,
          undosUsed: safeUndosUsed,
          comboBonus: safeComboBonus,
          noUndoBonus: safeNoUndoBonus,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        if (FIREBASE_LOGS_ENABLED) {
          console.error("[highScores] write failed:", err);
        }
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }

      return entry;
    },
    [isRemote]
  );

  return { scores, submit, isRemote, isLoading, error };
};

export default useRemoteHighScores;
