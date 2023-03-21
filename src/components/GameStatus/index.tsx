import styles from "./GameStatus.module.css";

type props = {
  gameOver: boolean;
};

const renderGameStatus = (gameOver: boolean): string => {
  return gameOver ? "game-over" : "playing";
};

const GameStatus = ({ gameOver }: props) => {
  return (
    <div data-testid="gamestatus" className={`${styles.gamestatus} ${gameOver && styles.gameover}`} data-status={renderGameStatus(gameOver)}>
      {renderGameStatus(gameOver)}
    </div>
  );
};

export default GameStatus;
