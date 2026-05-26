import styles from "./Score.module.css";

type props = {
  title: string;
  score: number;
  historyScore?: number;
  // Explicit "+N gained" amount for the pop animation. When provided it
  // overrides the score−historyScore delta, so the animation can show just the
  // raw move gain even when `score` includes a bonus that isn't a per-move gain.
  gain?: number;
};

const Score = ({ title, score, historyScore, gain }: props) => {
  const totalScore =
    gain !== undefined ? gain : historyScore === undefined ? 0 : score - historyScore;
  return (
    <div data-testid="score" className={styles.scoreWrapper}>
      <h2 className={styles.scoreTitle}>{title}</h2>
      <p
        className={`${totalScore > 0 ? styles.score : ""}`}
        key={score}
        data-value={`+${totalScore}`}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${title}: ${score}`}>
        {score}
      </p>
    </div>
  );
};

export default Score;
