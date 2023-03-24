import styles from "./Instructions.module.css";

const Instructions = () => {
  return (
    <section data-testid="instructions" className={styles.instructionsWrapper} id="howtoplay">
      <p className={styles.text}>
        <strong> HOW TO PLAY:</strong> Use your
        <strong> q, w, e, a, s, d</strong> keys to move the tiles. Tiles with the same number
        <strong> merge into one</strong> when they touch. Add them up to reach
        <strong> 2048!</strong>{" "}
      </p>
      <a href="#game" className="link">
        Start playing →
      </a>
    </section>
  );
};

export default Instructions;
