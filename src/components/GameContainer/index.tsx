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
  isWin: boolean;
  showCoords?: boolean;
  dismissOverlay?: () => void;
};

const GameContainer = ({ tileSet, grid, radius, resetGameHandler = () => {}, isGameOver, isWin, showCoords = false, dismissOverlay = () => {} }: props) => {

  return (
    <main className={styles.gameWrapper} id="game">
      {(isGameOver || isWin) && (
        <div className={`${styles.gameOverOverlay} ${isWin ? styles.isWin : ""}`} data-testid="overlay">
          <h4>{isWin ? "You Win!" : "Game Over :("}</h4>
          <Button clickHandler={() => resetGameHandler(radius)} text='Try Again'/>
          {isWin && <Button clickHandler={dismissOverlay} text='Keep Playing'/>}
        </div>
      )}
      <div className={styles.gameContainer} style={{transform: `scale(${(10-radius)/10})`}}>
        {tileSet.map((tile) => (
          <Tile key={tile.id} {...getPositionFromCoordinates(tile)} value={tile.value}/>
        ))}
        {grid.map((coords, index) => (
          <Block key={index} {...getPositionFromCoordinates(coords)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} showCoords={showCoords} />
        ))}
      </div>
    </main>
  );
};

export default React.memo(GameContainer);
