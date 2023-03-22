import React, {useEffect} from 'react'
import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../App/utils";
import Button from "../Button";

type props = {
  tileSet: gridElement[];
  grid: gridElement[];
  resetGameHandler?: React.MouseEventHandler;
  isGameOver: boolean;
  showCoords?: boolean;
};

const GameContainer = ({ tileSet, grid, resetGameHandler, isGameOver, showCoords }: props) => {

  return (
    <div className={styles.gameWrapper} id="game">
      {isGameOver && (
        <div className={styles.gameOverOverlay}>
          <h4>Game Over :(</h4>
          <Button clickHandler={resetGameHandler} text='Try Again'/>
        </div>
      )}
      <div className={styles.gameContainer}>
        {tileSet.map((tile) => (
          <Tile key={tile.id} {...getPositionFromCoordinates(tile)} value={tile.value} />
        ))}
        {grid.map((coords, index) => (
          <Block key={index} {...getPositionFromCoordinates(coords)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} showCoords={showCoords} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(GameContainer);
