import styles from "./Instructions.module.css";

const Instructions = () => {
  return (
    <section data-testid="instructions" className={styles.instructionsWrapper}>
      <p className={`${styles.text} ${styles.keyboardOnly}`}>
        <strong> HOW TO PLAY:</strong> Use
        <strong> q, w, e, a, s, d</strong> or the <strong>arrow keys</strong> to move the tiles. Tiles with the same number
        <strong> merge into one</strong> when they touch. Add them up to reach
        <strong> 2048!</strong>
      </p>
      <p className={`${styles.text} ${styles.touchOnly}`}>
        <strong> HOW TO PLAY:</strong> <strong>Swipe</strong> the board in any of the
        <strong> 6 directions</strong> to move the tiles. Tiles with the same number
        <strong> merge into one</strong> when they touch. Add them up to reach
        <strong> 2048!</strong>
      </p>
    </section>
  );
};

export default Instructions;
