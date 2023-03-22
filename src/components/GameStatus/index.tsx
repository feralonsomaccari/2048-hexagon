import styles from "./GameStatus.module.css";

type props = {
  isGameOver: boolean;
};

const renderGameStatus = (isGameOver: boolean): string => {
  return isGameOver ? "game-over" : "playing";
};

const GameStatus = ({ isGameOver }: props) => {
  return (
    <div data-testid="game-status" className={`${styles.gamestatus} ${isGameOver && styles.gameOver}`} data-status={renderGameStatus(isGameOver)}>
      {renderGameStatus(isGameOver)}
    </div>
  );
};

export default GameStatus;
