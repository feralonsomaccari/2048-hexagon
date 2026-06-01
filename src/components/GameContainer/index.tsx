import React from 'react'
import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../../utils/gameLogic";
import Button from "../Button";
import HighScorePrompt from "../Leaderboard/HighScorePrompt";
import Confetti from "../Confetti";
import TwitterIcon from "../TwitterIcon";
import TrophyIcon from "../TrophyIcon";
import UndoIcon from "../UndoIcon";
import powerUpStyles from "../PowerUpBar/PowerUpBar.module.css";
import { DOUBLE_MAX_VALUE, WIN_TILE_BY_RADIUS } from "../../config/gameConfig";

type props = {
  tileSet: gridElement[];
  grid: gridElement[];
  radius: number;
  resetGameHandler?: (radius: number) => void;

  onTryAgain?: () => void;
  isGameOver: boolean;
  isWin: boolean;
  dismissOverlay?: () => void;
  viewport?: { width: number; height?: number; isMobile: boolean };
  pendingHighScore?: boolean;
  score?: number;
  baseScore?: number;
  powerUpBonus?: number;
  unusedPowerUps?: number;
  movesCount?: number;
  onSubmitHighScore?: (name: string) => void;
  beatsHighScore?: boolean;
  isRemoveMode?: boolean;
  onRemoveTile?: (tile: gridElement) => void;
  removingTileId?: number | null;
  isSwapMode?: boolean;
  selectedSwapTileId?: number | null;
  onSwapSelect?: (tile: gridElement) => void;
  isDoubleMode?: boolean;
  onDoubleTile?: (tile: gridElement) => void;
  canReviveWithUndo?: boolean;
  undosRemaining?: number;
  onReviveWithUndo?: () => void;
};

const EDGE_LENGTH = 66.5;
const EDGE_W = (EDGE_LENGTH * 3) / 2;
const EDGE_H = (EDGE_LENGTH * Math.sqrt(3)) / 2;
const TILE_WIDTH = 140;
const TILE_HEIGHT = 121.1;
const DEFAULT_VIEWPORT = { width: 576, height: 800, isMobile: false };

const naturalGridHeight = (radius: number) => 4 * radius * EDGE_H + TILE_HEIGHT;
const naturalGridWidth = (radius: number) => 2 * radius * EDGE_W + TILE_WIDTH;

const GameContainer = React.forwardRef<HTMLElement, props>(({ tileSet, grid, radius, resetGameHandler = () => { }, onTryAgain, isGameOver, isWin, dismissOverlay = () => { }, viewport = DEFAULT_VIEWPORT, pendingHighScore = false, score = 0, baseScore = score, powerUpBonus = 0, unusedPowerUps = 0, movesCount = 0, onSubmitHighScore, beatsHighScore = false, isRemoveMode = false, onRemoveTile, removingTileId = null, isSwapMode = false, selectedSwapTileId = null, onSwapSelect, isDoubleMode = false, onDoubleTile, canReviveWithUndo = false, undosRemaining = 0, onReviveWithUndo }, ref) => {

  const innerRef = React.useRef<HTMLElement | null>(null);
  const [availableHeight, setAvailableHeight] = React.useState(0);

  const SHINE_DURATION = 900;
  const winOnMountRef = React.useRef(isWin);
  const [winRevealed, setWinRevealed] = React.useState(isWin);
  React.useEffect(() => {
    if (!isWin) {
      winOnMountRef.current = false;
      setWinRevealed(false);
      return;
    }
    if (winOnMountRef.current) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setWinRevealed(true);
      return;
    }
    const timer = window.setTimeout(() => setWinRevealed(true), SHINE_DURATION);
    return () => window.clearTimeout(timer);
  }, [isWin]);

  const COLLAPSE_DURATION = 400;
  const gameOverOnMountRef = React.useRef(isGameOver);
  const [gameOverRevealed, setGameOverRevealed] = React.useState(isGameOver);
  React.useEffect(() => {
    if (!isGameOver) {
      gameOverOnMountRef.current = false;
      setGameOverRevealed(false);
      return;
    }
    if (gameOverOnMountRef.current) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setGameOverRevealed(true);
      return;
    }
    const timer = window.setTimeout(() => setGameOverRevealed(true), COLLAPSE_DURATION);
    return () => window.clearTimeout(timer);
  }, [isGameOver]);

  const handleTryAgain = React.useCallback(() => {
    if (onTryAgain) onTryAgain();
    else resetGameHandler(radius);
  }, [onTryAgain, resetGameHandler, radius]);

  const handleShare = React.useCallback(() => {
    const winTile = WIN_TILE_BY_RADIUS[radius] ?? 2048;
    const url = "https://2048hexagon.com";
    const text = `I reached ${winTile} on 2048 Hexagon with ${score} points in ${movesCount} move${movesCount === 1 ? "" : "s"}! Can you beat me?`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }, [radius, score, movesCount]);
  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref]
  );
  React.useEffect(() => {
    const measure = () => {
      const node = innerRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top;
      setAvailableHeight(Math.max(0, window.innerHeight - top - 12));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isWin, viewport.width, viewport.height, radius]);

  const mergeScore = baseScore;
  const hasBreakdown = powerUpBonus > 0;
  const natural = naturalGridHeight(radius);
  const naturalWidth = naturalGridWidth(radius);
  const desktopDesignWidth = naturalWidth * ((10 - radius) / 10);
  const targetWidth = viewport.isMobile
    ? Math.min(viewport.width, naturalWidth)
    : desktopDesignWidth;
  const widthScale = targetWidth / naturalWidth;
  // Vertical room below the board top, reserving space for the power-up bar
  // and footer that render after the board so the page fits without scrolling.
  const POWER_UP_BAR_RESERVE = 110;
  // Desktop additionally renders the attribution footer below the power-up bar,
  // so reserve extra room to keep it on-screen without vertical overflow.
  const FOOTER_RESERVE = 60;
  const verticalReserve =
    POWER_UP_BAR_RESERVE + (viewport.isMobile ? 0 : FOOTER_RESERVE);
  const heightScale =
    availableHeight > 0 ? (availableHeight - verticalReserve) / natural : widthScale;
  const scale = Math.max(0.4, Math.min(widthScale, heightScale));
  const marginBottom = natural * (scale - 1);
  const boardRenderedHeight = natural * scale;

  const winTileValue = WIN_TILE_BY_RADIUS[radius] ?? 2048;
  const winningTileId = React.useMemo(() => {
    if (!isWin) return null;
    let best: gridElement | null = null;
    for (const tile of tileSet) {
      if (tile.value >= winTileValue && (!best || tile.value > best.value)) best = tile;
    }
    return best?.id ?? null;
  }, [isWin, tileSet, winTileValue]);

  const overlayShown = (isGameOver && gameOverRevealed) || (isWin && winRevealed);
  const shineActive = isWin && !winRevealed;

  return (
    <main
      ref={setRefs}
      className={styles.gameWrapper}
      id="game"
      style={{ height: `${boardRenderedHeight}px` }}
      aria-label={`Hexagonal 2048 board, ${tileSet.length} tile${tileSet.length === 1 ? "" : "s"} in play`}
    >
      {isWin && winRevealed && <Confetti />}
      <div className={styles.boardZone}>
        <div className={styles.gameContainer} style={{ width: `${naturalWidth}px`, height: `${natural}px`, transform: `scale(${scale})`, marginBottom: `${marginBottom}px` }}>
          {tileSet.map((tile) => {
            const isRemoving = tile.id != null && tile.id === removingTileId;
            return (
            <Tile
              key={tile.id}
              {...getPositionFromCoordinates(tile, radius)}
              value={tile.value}
              merged={tile.merged}
              removing={isRemoving}
              winning={shineActive && tile.id != null && tile.id === winningTileId}
              targeting={!isRemoving && (isRemoveMode || isSwapMode || isDoubleMode)}
              targetable={isDoubleMode ? tile.value <= DOUBLE_MAX_VALUE : true}
              targetingAction={isDoubleMode ? "double" : isSwapMode ? "swap" : "remove"}
              selected={isSwapMode && tile.id === selectedSwapTileId}
              onSelect={
                isDoubleMode
                  ? onDoubleTile
                    ? () => onDoubleTile(tile)
                    : undefined
                  : isSwapMode
                    ? onSwapSelect
                      ? () => onSwapSelect(tile)
                      : undefined
                    : onRemoveTile
                      ? () => onRemoveTile(tile)
                      : undefined
              }
            />
            );
          })}
          {grid.map((coords, index) => (
            <Block key={index} {...getPositionFromCoordinates(coords, radius)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} />
          ))}
        </div>
      </div>
      {overlayShown && (
        <div
          className={`${styles.gameOverOverlay} ${isWin ? styles.isWin : ""}`}
          data-testid="overlay"
          role="alertdialog"
          aria-labelledby="overlay-title"
          aria-atomic="true"
          aria-modal="true"
        >
          {isWin && (
            <span className={styles.overlayIcon} aria-hidden="true">
              <TrophyIcon size={56} />
            </span>
          )}
          <h2 id="overlay-title" className={styles.overlayTitle}>{isWin ? `You reached ${WIN_TILE_BY_RADIUS[radius] ?? 2048}!` : "Game Over"}</h2>
          {hasBreakdown && (
            <dl className={styles.scoreBreakdown} data-testid="score-breakdown">
              <div className={styles.scoreBreakdownRow}>
                <dt>Score</dt>
                <dd>{mergeScore}</dd>
              </div>
              {powerUpBonus > 0 && (
                <div className={styles.scoreBreakdownRow}>
                  <dt>Unused power-up{unusedPowerUps > 1 ? ` (×${unusedPowerUps})` : ""}</dt>
                  <dd>+{powerUpBonus}</dd>
                </div>
              )}
            </dl>
          )}
          {!(pendingHighScore && onSubmitHighScore) && (
            <p className={styles.overlayScore} data-testid="overlay-moves">
              {hasBreakdown ? "Final Score" : "Score"}: {score} in {movesCount} move{movesCount === 1 ? "" : "s"}
            </p>
          )}
          {pendingHighScore && onSubmitHighScore && (
            <HighScorePrompt
              score={score}
              onSubmit={onSubmitHighScore}
              beatsHighScore={beatsHighScore}
            />
          )}
          <div className={styles.overlayActions}>
            {!isWin && canReviveWithUndo && onReviveWithUndo && (
              <button
                type="button"
                className={powerUpStyles.tile}
                onClick={onReviveWithUndo}
                title="Undo"
                aria-label={`Undo, ${undosRemaining} remaining`}
              >
                <UndoIcon className={powerUpStyles.icon} />
                <span className={powerUpStyles.badge} aria-hidden="true">
                  {undosRemaining}
                </span>
              </button>
            )}
            <Button clickHandler={handleTryAgain} text='Try Again' />
            {isWin && <Button clickHandler={dismissOverlay} text='Keep Playing' />}
            {isWin && (
              <button
                type="button"
                className={styles.shareCorner}
                onClick={handleShare}
                title="Share your win on Twitter"
                data-testid="share-btn"
                aria-label="Share your win on Twitter"
              >
                <TwitterIcon className={styles.shareIcon} />
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
});

GameContainer.displayName = "GameContainer";

export default React.memo(GameContainer);
