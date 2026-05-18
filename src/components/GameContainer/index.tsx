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
  dismissOverlay?: () => void;
  windowScale?: number;
};

const EDGE_LENGTH = 66.5;
const EDGE_W = (EDGE_LENGTH * 3) / 2;
const EDGE_H = (EDGE_LENGTH * Math.sqrt(3)) / 2;
const TILE_WIDTH = 140;
const TILE_HEIGHT = 121.1;

const naturalGridHeight = (radius: number) => 4 * radius * EDGE_H + TILE_HEIGHT;
const naturalGridWidth = (radius: number) => 2 * radius * EDGE_W + TILE_WIDTH;

const GameContainer = ({ tileSet, grid, radius, resetGameHandler = () => {}, isGameOver, isWin, dismissOverlay = () => {}, windowScale = 1 }: props) => {
  const radiusScale = (10 - radius) / 10;
  const scale = radiusScale * windowScale;
  const natural = naturalGridHeight(radius);
  const naturalWidth = naturalGridWidth(radius);
  const marginBottom = natural * (scale - 1);

  return (
    <main className={styles.gameWrapper} id="game" style={{ height: `${natural * scale}px` }}>
      {(isGameOver || isWin) && (
        <div className={`${styles.gameOverOverlay} ${isWin ? styles.isWin : ""}`} data-testid="overlay">
          <h4>{isWin ? "You Win!" : "Game Over :("}</h4>
          <Button clickHandler={() => resetGameHandler(radius)} text='Try Again'/>
          {isWin && <Button clickHandler={dismissOverlay} text='Keep Playing'/>}
        </div>
      )}
      <div className={styles.gameContainer} style={{ width: `${naturalWidth}px`, height: `${natural}px`, transform: `scale(${scale})`, marginBottom: `${marginBottom}px` }}>
        {tileSet.map((tile) => (
          <Tile key={tile.id} {...getPositionFromCoordinates(tile, radius)} value={tile.value} merged={tile.merged} />
        ))}
        {grid.map((coords, index) => (
          <Block key={index} {...getPositionFromCoordinates(coords, radius)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} />
        ))}
      </div>
    </main>
  );
};

export default React.memo(GameContainer);
