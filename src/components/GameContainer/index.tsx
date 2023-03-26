import React from 'react'
import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../../utils";
import Button from "../Button";

type props = {
  tileSet: gridElement[];
  grid: gridElement[];
  radius: number;
  resetGameHandler?: (radius: number) => void;
  isGameOver: boolean;
  showCoords?: boolean;
};

const GameContainer = ({ tileSet, grid, radius, resetGameHandler = () => {}, isGameOver, showCoords = false }: props) => {

  return (
    <main className={styles.gameWrapper} id="game">
      {isGameOver && (
        <div className={styles.gameOverOverlay} data-testid="overlay">
          <h4>Game Over :(</h4>
          <Button clickHandler={() => resetGameHandler(radius)} text='Try Again'/>
        </div>
      )}
      <div className={styles.gameContainer} style={{transform: `scale(${(10-radius)/10})`}}>
        {tileSet.map((tile) => (
          <Tile key={tile.id} {...getPositionFromCoordinates(tile, radius)} value={tile.value} radius={radius}/>
        ))}
        {grid.map((coords, index) => (
          <Block key={index} {...getPositionFromCoordinates(coords, radius)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} radius={radius} showCoords={showCoords} />
        ))}
      </div>
    </main>
  );
};

export default React.memo(GameContainer);
