import styles from "./Leaderboard.module.css";
import {
  BOARD_LABELS,
  HighScoreEntry,
  HighScores,
  MAX_ENTRIES_PER_BOARD,
} from "../../utils/highScores";
import { LEADERBOARD_SHOW_MOVES } from "../../config/gameConfig";

type props = {
  scores: HighScores;
  highlightRadius?: number;
  highlightEntry?: HighScoreEntry | null;
  isLoading?: boolean;
};

const radiusOrder = [1, 2];

const isPreRelease = (): boolean => {
  const major = Number(__APP_VERSION__.split(".")[0]);
  return Number.isFinite(major) && major < 1;
};

const Leaderboard = ({ scores, highlightRadius, highlightEntry, isLoading = false }: props) => {
  const isHighlighted = (
    radius: number,
    entry: HighScoreEntry,
    index: number,
    list: HighScoreEntry[]
  ): boolean => {
    if (!highlightEntry || highlightRadius !== radius) return false;
    if (entry.name !== highlightEntry.name) return false;
    if (entry.score !== highlightEntry.score) return false;
    if (entry.date !== highlightEntry.date) return false;
    const firstMatch = list.findIndex(
      (e) =>
        e.name === highlightEntry.name &&
        e.score === highlightEntry.score &&
        e.date === highlightEntry.date
    );
    return firstMatch === index;
  };

  return (
    <div className={styles.wrapper} data-testid="leaderboard">
      {radiusOrder.map((radius) => {
        const list = scores[radius] ?? [];
        return (
          <section key={radius} className={styles.boardSection}>
            <span className={styles.boardLabel}>{BOARD_LABELS[radius]}</span>
            {isLoading ? (
              <p className={styles.empty}>Loading…</p>
            ) : list.length === 0 ? (
              <p className={styles.empty}>No scores yet — be the first.</p>
            ) : (
              <ol className={styles.list}>
                {list.slice(0, MAX_ENTRIES_PER_BOARD).map((entry, index) => {
                  const highlighted = isHighlighted(radius, entry, index, list);
                  return (
                  <li
                    key={`${entry.name}-${entry.date}-${index}`}
                    className={`${styles.row} ${highlighted ? styles.highlighted : ""}`}
                    aria-live={highlighted ? "polite" : undefined}
                  >
                    <span className={styles.rank}>{index + 1}.</span>
                    <span className={styles.name}>{entry.name}</span>
                    <span className={styles.scoreCell}>
                      <span className={styles.score}>{entry.score}</span>
                      {LEADERBOARD_SHOW_MOVES && typeof entry.movesCount === "number" && (
                        <span className={styles.moves}>
                          {entry.movesCount} move{entry.movesCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </span>
                  </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
      {isPreRelease() && (
        <p className={styles.devNotice} data-testid="leaderboard-dev-notice">
          This game is under development - the leaderboard may be wiped at release.
        </p>
      )}
    </div>
  );
};

export default Leaderboard;
