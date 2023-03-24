import styles from "./Score.module.css";

type props = {
  title: string;
  score: number;
  historyScore?: number;
};

const Score = ({ title, score, historyScore = 0}: props) => {

  return (
    <div data-testid="score" className={styles.scoreWrapper}>
      <h3 className={styles.scoreTitle}>{title}</h3>
      <p className={`${score > 0 ? styles.score : ''}`} key={score} data-value={`+${score - historyScore}`}>{score}</p>
    </div>
  );
};

export default Score;
