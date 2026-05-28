import React from 'react'
import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../../utils/gameLogic";
import Button from "../Button";
import HighScorePrompt from "../Leaderboard/HighScorePrompt";
import Confetti from "../Confetti";
import TwitterIcon from "../TwitterIcon";
import { WIN_TILE_BY_RADIUS } from "../../config/gameConfig";

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
  comboBonus?: number;
  noUndoBonus?: number;
  noUndoBonusUndos?: number;
  movesCount?: number;
  onSubmitHighScore?: (name: string) => void;
  beatsHighScore?: boolean;
};

const EDGE_LENGTH = 66.5;
const EDGE_W = (EDGE_LENGTH * 3) / 2;
const EDGE_H = (EDGE_LENGTH * Math.sqrt(3)) / 2;
const TILE_WIDTH = 140;
const TILE_HEIGHT = 121.1;
const DEFAULT_VIEWPORT = { width: 576, height: 800, isMobile: false };

const naturalGridHeight = (radius: number) => 4 * radius * EDGE_H + TILE_HEIGHT;
const naturalGridWidth = (radius: number) => 2 * radius * EDGE_W + TILE_WIDTH;

const GameContainer = React.forwardRef<HTMLElement, props>(({ tileSet, grid, radius, resetGameHandler = () => { }, onTryAgain, isGameOver, isWin, dismissOverlay = () => { }, viewport = DEFAULT_VIEWPORT, pendingHighScore = false, score = 0, baseScore = score, comboBonus = 0, noUndoBonus = 0, noUndoBonusUndos = 0, movesCount = 0, onSubmitHighScore, beatsHighScore = false }, ref) => {

  const innerRef = React.useRef<HTMLElement | null>(null);
  const [availableHeight, setAvailableHeight] = React.useState(0);

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

  const mergeScore = baseScore - comboBonus;
  const hasBreakdown = comboBonus > 0 || noUndoBonus > 0;
  const natural = naturalGridHeight(radius);
  const naturalWidth = naturalGridWidth(radius);
  const desktopDesignWidth = naturalWidth * ((10 - radius) / 10);
  const targetWidth = viewport.isMobile
    ? Math.min(viewport.width, naturalWidth)
    : desktopDesignWidth;
  const widthScale = targetWidth / naturalWidth;
  // Vertical room below the board top, reserving space for the power-up bar
  // that renders after the board so the page fits without scrolling on mobile.
  const POWER_UP_BAR_RESERVE = 110;
  const heightScale =
    viewport.isMobile && availableHeight > 0
      ? (availableHeight - POWER_UP_BAR_RESERVE) / natural
      : widthScale;
  const scale = isWin
    ? widthScale
    : Math.max(0.4, Math.min(widthScale, heightScale));
  const marginBottom = natural * (scale - 1);
  const boardRenderedHeight = natural * scale;

  const overlayShown = isGameOver || isWin;

  const PANEL_RESERVE = 170;
  const mobilePanelScale =
    viewport.isMobile && availableHeight > 0
      ? Math.max(
        0.35,
        Math.min(0.66, (availableHeight - PANEL_RESERVE) / boardRenderedHeight)
      )
      : 0.55;

  return (
    <main
      ref={setRefs}
      className={`${styles.gameWrapper} ${isWin ? styles.winLayout : ""}`}
      id="game"
      style={
        isWin
          ? ({
            "--board-rendered-height": `${boardRenderedHeight}px`,
            "--win-scale-mobile": mobilePanelScale,
          } as React.CSSProperties)
          : { height: `${boardRenderedHeight}px` }
      }
      aria-label={`Hexagonal 2048 board, ${tileSet.length} tile${tileSet.length === 1 ? "" : "s"} in play`}
    >
      {isWin && <Confetti />}
      <div className={`${styles.boardZone} ${isWin ? styles.boardZoneWin : ""}`}>
        <div className={styles.gameContainer} style={{ width: `${naturalWidth}px`, height: `${natural}px`, transform: `scale(${scale})`, marginBottom: `${marginBottom}px` }}>
          {tileSet.map((tile) => (
            <Tile key={tile.id} {...getPositionFromCoordinates(tile, radius)} value={tile.value} merged={tile.merged} />
          ))}
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
            <div className={styles.shareContainer}>
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
            </div>
          )}
          {/* {isWin && <span className={styles.overlayIcon} aria-hidden="true">🏆</span>} */}
          <h2 id="overlay-title" className={styles.overlayTitle}>{isWin ? `You reached ${WIN_TILE_BY_RADIUS[radius] ?? 2048}!` : "Game Over"}</h2>
          {hasBreakdown && (
            <dl className={styles.scoreBreakdown} data-testid="score-breakdown">
              <div className={styles.scoreBreakdownRow}>
                <dt>Score</dt>
                <dd>{mergeScore}</dd>
              </div>
              {comboBonus > 0 && (
                <div className={styles.scoreBreakdownRow}>
                  <dt>Combo bonus</dt>
                  <dd>+{comboBonus}</dd>
                </div>
              )}
              {noUndoBonus > 0 && (
                <div className={styles.scoreBreakdownRow}>
                  <dt>No-undo bonus{noUndoBonusUndos > 1 ? ` (×${noUndoBonusUndos})` : ""}</dt>
                  <dd>+{noUndoBonus}</dd>
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
            <Button clickHandler={handleTryAgain} text='Try Again' />
            {isWin && <Button clickHandler={dismissOverlay} text='Keep Playing' />}
          </div>
        </div>
      )}
    </main>
  );
});

GameContainer.displayName = "GameContainer";

export default React.memo(GameContainer);
