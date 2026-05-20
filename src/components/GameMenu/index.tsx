import styles from "./GameMenu.module.css";
import GameStatus from "../GameStatus";
import Button from "../Button";

type props = {
  isGameOver: boolean;
  onNewGameHandler?: () => void;
  undoHandler?: () => void;
  isUndoAvailable?: boolean;
  remainingUndos?: number;
  scores?: React.ReactNode;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onHighScoresHandler?: () => void;
};

const GameMenu = ({
  isGameOver,
  undoHandler,
  onNewGameHandler,
  isUndoAvailable = true,
  remainingUndos,
  scores,
  theme,
  onToggleTheme,
  onHighScoresHandler,
}: props) => {
  return (
    <article data-testid="game-menu" className={styles.gameMenu}>
      <div className={styles.top}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title} aria-label="2048 Hexagon">
            <span aria-hidden="true">2048 ⬡</span>
          </h1>
          <span className={styles.subtitle}>hexagon version</span>
          <p className={styles.srOnly}>
            A hexagonal twist on the classic 2048 puzzle game. Slide and merge tiles on a hex grid to reach 2048.
          </p>
        </div>
        {scores && <div className={styles.scores}>{scores}</div>}
      </div>
      <div className={styles.divider} />
      <div className={styles.bottom}>
        <GameStatus isGameOver={isGameOver} />
        <div className={styles.actions}>
          <Button
            clickHandler={undoHandler}
            disabled={!isUndoAvailable || remainingUndos === 0}
            text={remainingUndos !== undefined ? `Undo (${remainingUndos})` : "Undo"}
            extraProps={{ title: "Undo last action", "data-testid": "undo-btn" }}
          />
          <Button
            clickHandler={onNewGameHandler}
            text="New Game"
            extraProps={{ title: "Start a new game", "data-testid": "new-game-btn" }}
          />
          {onHighScoresHandler && (
            <Button
              clickHandler={onHighScoresHandler}
              text="Scores"
              extraProps={{ title: "View high scores", "data-testid": "high-scores-btn" }}
            />
          )}
          {onToggleTheme && (
            <Button
              clickHandler={onToggleTheme}
              text={theme === "dark" ? "Light" : "Dark"}
              extraProps={{
                title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
                "data-testid": "theme-toggle-btn",
                "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
};

export default GameMenu;
