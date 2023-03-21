import styles from "./Score.module.css";

type props = {
  title: string;
  score: number;
};

const Score = ({ title, score }: props) => {
  return (
    <div data-testid="score" className={styles.scoreWrapper}>
      <h3 className={styles.scoreTitle}>{title}</h3>
      <h4>{score}</h4>
    </div>
  );
};

export default Score;
