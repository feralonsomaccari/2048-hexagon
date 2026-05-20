import React from 'react'
import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../../utils/gameLogic";
import Button from "../Button";
import HighScorePrompt from "../Leaderboard/HighScorePrompt";

type props = {
  tileSet: gridElement[];
  grid: gridElement[];
  radius: number;
  resetGameHandler?: (radius: number) => void;
  isGameOver: boolean;
  isWin: boolean;
  dismissOverlay?: () => void;
  viewport?: { width: number; isMobile: boolean };
  pendingHighScore?: boolean;
  score?: number;
  onSubmitHighScore?: (name: string) => void;
};

const EDGE_LENGTH = 66.5;
const EDGE_W = (EDGE_LENGTH * 3) / 2;
const EDGE_H = (EDGE_LENGTH * Math.sqrt(3)) / 2;
const TILE_WIDTH = 140;
const TILE_HEIGHT = 121.1;
const DEFAULT_VIEWPORT = { width: 576, isMobile: false };

const naturalGridHeight = (radius: number) => 4 * radius * EDGE_H + TILE_HEIGHT;
const naturalGridWidth = (radius: number) => 2 * radius * EDGE_W + TILE_WIDTH;

const GameContainer = React.forwardRef<HTMLElement, props>(({ tileSet, grid, radius, resetGameHandler = () => {}, isGameOver, isWin, dismissOverlay = () => {}, viewport = DEFAULT_VIEWPORT, pendingHighScore = false, score = 0, onSubmitHighScore }, ref) => {
  const natural = naturalGridHeight(radius);
  const naturalWidth = naturalGridWidth(radius);
  const desktopDesignWidth = naturalWidth * ((10 - radius) / 10);
  const targetWidth = viewport.isMobile
    ? Math.min(viewport.width, naturalWidth)
    : desktopDesignWidth;
  const scale = targetWidth / naturalWidth;
  const marginBottom = natural * (scale - 1);

  return (
    <main
      ref={ref}
      className={styles.gameWrapper}
      id="game"
      style={{ height: `${natural * scale}px` }}
      aria-label={`Hexagonal 2048 board, ${tileSet.length} tile${tileSet.length === 1 ? "" : "s"} in play`}
    >
      {(isGameOver || isWin) && (
        <div
          className={`${styles.gameOverOverlay} ${isWin ? styles.isWin : ""}`}
          data-testid="overlay"
          role="alertdialog"
          aria-labelledby="overlay-title"
        >
          <h2 id="overlay-title">{isWin ? "You Win!" : "Game Over"}</h2>
          {pendingHighScore && onSubmitHighScore && (
            <HighScorePrompt score={score} onSubmit={onSubmitHighScore} />
          )}
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
});

GameContainer.displayName = "GameContainer";

export default React.memo(GameContainer);
