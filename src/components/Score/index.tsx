import styles from "./Score.module.css";

type props = {
  title: string;
  score: number;
  historyScore?: number;
};

const Score = ({ title, score, historyScore = 0 }: props) => {
  const totalScore = score - historyScore;
  return (
    <div data-testid="score" className={styles.scoreWrapper}>
      <h3 className={styles.scoreTitle}>{title}</h3>
      <p
        className={`${totalScore > 0 ? styles.score : ""}`}
        key={score}
        data-value={`+${totalScore}`}>
        {score}
      </p>
    </div>
  );
};

export default Score;
