import styles from "./Score.module.css";
import useCountUp from "../../hooks/useCountUp";

type props = {
  title: string;
  score: number;
};

const Score = ({ title, score }: props) => {
  const displayScore = useCountUp(score);
  return (
    <div data-testid="score" className={styles.scoreWrapper}>
      <h2 className={styles.scoreTitle}>{title}</h2>
      <p
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${title}: ${score}`}>
        {displayScore}
      </p>
    </div>
  );
};

export default Score;
