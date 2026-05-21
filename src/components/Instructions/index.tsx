import styles from "./Instructions.module.css";
import { WIN_TILE_BY_RADIUS } from "../../config/gameConfig";

type props = {
  radius?: number;
};

const Instructions = ({ radius = 2 }: props) => {
  const target = WIN_TILE_BY_RADIUS[radius] ?? 2048;
  return (
    <section data-testid="instructions" className={styles.instructionsWrapper}>
      <p className={`${styles.text} ${styles.keyboardOnly}`}>
        <strong> HOW TO PLAY:</strong> Use
        <strong> q, w, e, a, s, d</strong> or the <strong>arrow keys</strong> to move the tiles. Tiles with the same number
        <strong> merge into one</strong> when they touch. Add them up to reach
        <strong> {target}!</strong>
      </p>
      <p className={`${styles.text} ${styles.touchOnly}`}>
        <strong> HOW TO PLAY:</strong> <strong>Swipe</strong> the board in any of the
        <strong> 6 directions</strong> — or use the <strong>arrow keys</strong> or <strong>Q, W, E, A, S, D</strong> on a keyboard — to move the tiles. Tiles with the same number
        <strong> merge into one</strong> when they touch. Add them up to reach
        <strong> {target}!</strong>
      </p>
    </section>
  );
};

export default Instructions;
