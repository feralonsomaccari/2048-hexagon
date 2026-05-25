import styles from "./Score.module.css";

type props = {
  title: string;
  score: number;
  historyScore?: number;
};

const Score = ({ title, score, historyScore }: props) => {
  const totalScore = historyScore === undefined ? 0 : score - historyScore;
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
