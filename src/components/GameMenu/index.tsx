import styles from "./GameMenu.module.css";
import GameStatus from "../GameStatus";
import Score from "../Score";

type props = {
  resetGameHandler: React.MouseEventHandler;
  gameOver: boolean;
};

const GameMenu = ({ resetGameHandler, gameOver }: props) => {
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
          <Score title={"Score"} score={30}></Score>
          <Score title={"Best"} score={300}></Score>
        <button className={styles.button} onClick={resetGameHandler}>New Game</button>
      </div>
    </article>
  );
};

export default GameMenu;
