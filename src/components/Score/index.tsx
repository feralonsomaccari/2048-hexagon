import styles from "./Score.module.css";

type props = {
  title: string;
  score: number;
};

const Score = ({ title, score }: props) => {
  return (
    <div className={styles.scoreWrapper}>
      <h3 className={styles.scoreTitle}>{title}</h3>
      <h3>{score}</h3>
    </div>
  );
};

export default Score;
