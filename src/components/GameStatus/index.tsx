import styles from './GameStatus.module.css'

type props = {
  gameOver: boolean
}

const GameStatus = ({gameOver}: props) => {
  return (
    <div className={`${styles.gamestatus} ${gameOver && styles.gameover}`}>
      {gameOver ? (
        'Game Over :('
      ) : (
        'You still have valid movements!'
      )}
    </div>
  )
}

export default GameStatus