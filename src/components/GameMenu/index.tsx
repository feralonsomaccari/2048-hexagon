import styles from "./GameMenu.module.css";
import GameStatus from "../GameStatus";
import Button from "../Button";

type props = {
  isGameOver: boolean;
  onNewGameHandler?: () => void;
  undoHandler?: () => void;
  isUndoAvailable?: boolean;
  scores?: React.ReactNode;
};

const GameMenu = ({
  isGameOver,
  undoHandler,
  onNewGameHandler,
  isUndoAvailable = true,
  scores,
}: props) => {
  return (
    <article data-testid="game-menu" className={styles.gameMenu}>
      <div>
        <h1 className={styles.title}>2048 (Hexagon Version!)</h1>
        <p className={styles.text}>
          <b>Game Status:</b>
        </p>
        <GameStatus isGameOver={isGameOver} />
      </div>
      <div className={styles.right}>
        {scores && <div className={styles.scores}>{scores}</div>}
        <div className={styles.subMenu}>
          <Button
            clickHandler={undoHandler}
            disabled={!isUndoAvailable}
            text="Undo"
            extraProps={{ title: "Undo last action", "data-testid": "undo-btn" }}
          />
          <Button
            clickHandler={onNewGameHandler}
            text="New Game"
            extraProps={{ title: "Start a new game", "data-testid": "new-game-btn" }}
          />
        </div>
      </div>
    </article>
  );
};

export default GameMenu;
