import styles from "./GameMenu.module.css";
import GameStatus from "../GameStatus";

type props = {
  gameOver: boolean;
};

const GameMenu = ({ gameOver }: props) => {
  return (
    <article className={styles.gameMenu}>
      <div>
        <h1 className={styles.title}>2048</h1>
        <h2 className={styles.subtitle}>(HEXAGON version!)</h2>
        <p className={styles.text}>Join the tiles, get to <b>2048</b></p>
        <a className={styles.howTo} href={'#howtoplay'}>How to play →</a>
        <p className={styles.text}><b>Game Status:</b></p>
        <GameStatus gameOver={gameOver} />
      </div>
      <div className={styles.subMenu}>
        <p>Score</p>
        <button className={styles.button}>New Game</button>
      </div>
    </article>
  );
};

export default GameMenu;
