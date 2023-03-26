import styles from "./GameMenu.module.css";
import GameStatus from "../GameStatus";
import Score from "../Score";
import Button from "../Button";

type props = {
  isGameOver: boolean;
  onNewGameHandler?: () => void;
  undoHandler?: () => void;
  isUndoAvailable?: boolean
};

const GameMenu = ({ isGameOver, undoHandler, onNewGameHandler, isUndoAvailable = true }: props) => {
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
        
        <Button clickHandler={undoHandler} disabled={!isUndoAvailable} text='Undo' extraProps={{title: "Undo last action"}}/>
        <Button clickHandler={onNewGameHandler} text='Next Game' extraProps={{title: "Start a new game"}}/>
      </div>
    </article>
  );
};

export default GameMenu;
