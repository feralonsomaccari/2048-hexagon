import React from 'react'
import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../../utils/gameLogic";
import Button from "../Button";
import HighScorePrompt from "../Leaderboard/HighScorePrompt";
import Confetti from "../Confetti";
import { WIN_TILE_BY_RADIUS } from "../../config/gameConfig";

type props = {
  tileSet: gridElement[];
  grid: gridElement[];
  radius: number;
  resetGameHandler?: (radius: number) => void;
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

const GameContainer = React.forwardRef<HTMLElement, props>(({ tileSet, grid, radius, resetGameHandler = () => {}, isGameOver, isWin, dismissOverlay = () => {}, viewport = DEFAULT_VIEWPORT, pendingHighScore = false, score = 0, baseScore = score, comboBonus = 0, noUndoBonus = 0, noUndoBonusUndos = 0, onSubmitHighScore, beatsHighScore = false }, ref) => {
  // Measure the space the board area actually has from its top edge down to the
  // bottom of the viewport. Used to scale the board on a mobile win so the board
  // and the result panel together never overflow (which would scroll the page).
  // Measuring beats estimating page chrome, which varies by device and with the
  // mobile browser's collapsing URL bar.
  const innerRef = React.useRef<HTMLElement | null>(null);
  const [availableHeight, setAvailableHeight] = React.useState(0);
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

  // Pure merge points: the raw score with combo points peeled off so each
  // breakdown line is an honest, additive component of the final score.
  const mergeScore = baseScore - comboBonus;
  const hasBreakdown = comboBonus > 0 || noUndoBonus > 0;
  const natural = naturalGridHeight(radius);
  const naturalWidth = naturalGridWidth(radius);
  const desktopDesignWidth = naturalWidth * ((10 - radius) / 10);
  const targetWidth = viewport.isMobile
    ? Math.min(viewport.width, naturalWidth)
    : desktopDesignWidth;
  const scale = targetWidth / naturalWidth;
  const marginBottom = natural * (scale - 1);
  const boardRenderedHeight = natural * scale;
  const boardRenderedWidth = naturalWidth * scale;

  // On a win we keep the board on screen and reveal the result panel below/
  // beside it (the board shrinks). Game Over keeps the classic full-cover
  // overlay. `overlayShown` just gates rendering the overlay element itself.
  const overlayShown = isGameOver || isWin;

  // Extra shrink applied to the board on a mobile win so the board *and* the
  // result panel both fit in the space below the header without scrolling.
  // `availableHeight` is measured (top of the board area → bottom of viewport);
  // reserve room for the stacked panel and scale the board to fit the rest,
  // capped so it never grows. On wider screens the panel sits beside the board,
  // so a fixed gentle shrink (driven by CSS) is fine.
  const PANEL_RESERVE = 170; // px reserved for the result panel + gap on mobile (no trophy)
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
              "--board-rendered-width": `${boardRenderedWidth}px`,
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
          {isWin && <span className={styles.overlayIcon} aria-hidden="true">🏆</span>}
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
            <p className={styles.overlayScore}>
              {hasBreakdown ? "Final score" : "Score"}: {score}
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
            <Button clickHandler={() => resetGameHandler(radius)} text='Try Again'/>
            {isWin && <Button clickHandler={dismissOverlay} text='Keep Playing'/>}
          </div>
        </div>
      )}
    </main>
  );
});

GameContainer.displayName = "GameContainer";

export default React.memo(GameContainer);
