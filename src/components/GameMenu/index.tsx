import styles from "./GameMenu.module.css";
import GameStatus from "../GameStatus";
import Score from "../Score";
import Button from "../Button";

type props = {
  isGameOver: boolean;
  score: number;
  resetGameHandler?: React.MouseEventHandler;
  undoHandler?: React.MouseEventHandler;
};

const GameMenu = ({ isGameOver, score, undoHandler, resetGameHandler }: props) => {
  return (
    <article data-testid="game-menu" className={styles.gameMenu}>
      <div>
        <h1 className={styles.title}>2048</h1>
        <h2 className={styles.subtitle}>(HEXAGON version!)</h2>
        <p className={styles.text}>Join the tiles, get to <b>2048</b></p>
        <a className="link" href="#howtoplay">How to play →</a>
        <p className={styles.text}><b>Game Status:</b></p>
        <GameStatus isGameOver={isGameOver} />
      </div>
      <div className={styles.subMenu}>
        <div className={styles.scoreContainer}>
          <Score title="Score" score={score}/>
          <Score title="Best" score={0}/>
        </div>
        <Button clickHandler={undoHandler} text='Undo'/>
        <Button clickHandler={resetGameHandler} text='Next Game'/>
      </div>
    </article>
  );
};

export default GameMenu;
