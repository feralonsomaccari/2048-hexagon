import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import GameContainer from "../GameContainer";
import Score from "../Score";
import NewGameModal from "../NewGameMenu";
import Modal from "../Modal";
import Leaderboard from "../Leaderboard";
import {
  sortTileSet,
  findNextBlock,
  validMovementsAvailable,
  sortTileSetById,
  createHexGrid,
  isBlocked,
} from "../../utils/gameLogic";
import {
  HighScoreEntry,
  qualifiesForHighScore,
} from "../../utils/highScores";
import useLocalStorage from "../../hooks/useLocalStorage";
import useGameTiles from "../../hooks/useGameTiles";
import useViewport from "../../hooks/useWindowScale";
import useSwipe from "../../hooks/useSwipe";
import useTheme from "../../hooks/useTheme";
import useRemoteHighScores from "../../hooks/useRemoteHighScores";
import {
  loadSavedGame,
  saveGame,
  clearSavedGame,
  loadLastRadius,
  saveLastRadius,
} from "../../utils/savedGameStorage";
import { DEFAULT_RADIUS, LEADERBOARD_SIZE, MAX_UNDO_BY_RADIUS, NO_UNDO_BONUS_RATE_PER_UNDO, WIN_TILE_BY_RADIUS } from "../../config/gameConfig";

const initialSavedGame = loadSavedGame();
const initialRadius = initialSavedGame?.radius ?? loadLastRadius() ?? DEFAULT_RADIUS;

export const App: React.FC = () => {
  const [isModalShown, setIsModalShown] = useState(false);
  const [radius, setRadius] = useState(initialRadius);
  const [grid, setGrid] = useState<gridElement[]>(initialSavedGame?.grid ?? []);
  const [tileSet, setTileSet] = useState<gridElement[]>(initialSavedGame?.tileSet ?? []);
  const [historyTileSet, setHistoryTileSet] = useState<gridElement[]>(initialSavedGame?.historyTileSet ?? []);
  const [isMovementBlocked, setIsMovementBlocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(initialSavedGame?.isWin ?? false);
  const [hasKeptPlaying, setHasKeptPlaying] = useState(initialSavedGame?.hasKeptPlaying ?? false);
  const [score, setScore] = useState(initialSavedGame?.score ?? 0);
  const [isUndoAvailable, setIsUndoAvailable] = useState(initialSavedGame?.isUndoAvailable ?? false);
  const [undoCount, setUndoCount] = useState(initialSavedGame?.undoCount ?? 0)
  const [isMaxUndo, setIsMaxUndo] = useState(initialSavedGame?.isMaxUndo ?? false)
  const [historyScore, setHistoryScore] = useState(initialSavedGame?.historyScore ?? 0);
  const [maxScore, setMaxScore] = useLocalStorage<Record<string, number>>("maxScore", { 2: 0 });
  const { scores: highScores, submit: submitRemoteHighScore, isLoading: isHighScoresLoading } = useRemoteHighScores();
  const [isLeaderboardShown, setIsLeaderboardShown] = useState(false);
  const [pendingHighScore, setPendingHighScore] = useState(false);
  const [lastQualifyingEntry, setLastQualifyingEntry] = useState<HighScoreEntry | null>(null);
  const [lastQualifyingRadius, setLastQualifyingRadius] = useState<number | null>(null);
  const [serverResponse, fetchTiles] = useGameTiles([], initialRadius);
  const [theme, toggleTheme] = useTheme();
  const viewport = useViewport();
  const boardRef = useRef<HTMLElement>(null);
  const restoredRef = useRef<boolean>(!!initialSavedGame);

  const maxUndo = MAX_UNDO_BY_RADIUS[radius] ?? 0;

  // No-undo bonus: scales with the undos left *unused*. Each undo you decline
  // is worth NO_UNDO_BONUS_RATE_PER_UNDO of the score, so the bonus is
  // (maxUndo - undoCount) × rate. Small board: 0 used → +30%, 1 → +20%,
  // 2 → +10%, 3 → +0%. Normal board: 0 used → +10%, 1 → +0%. Evaluated at
  // submit-time, so undos used after "keep playing" reduce it too.
  const unusedUndos = Math.max(0, maxUndo - undoCount);
  const noUndoBonus = Math.round(score * NO_UNDO_BONUS_RATE_PER_UNDO * unusedUndos);
  const finalScore = score + noUndoBonus;

  useEffect(() => {
    if (initialSavedGame) return;
    setGrid(createHexGrid(radius));
  }, []);

  useEffect(() => {
    const legacyValue = (maxScore as unknown as { value?: number }).value;
    if (typeof legacyValue === "number") {
      setMaxScore({ 1: legacyValue });
    }
  }, []);

  useEffect(() => {
    if (restoredRef.current) return;
    setTileSet(serverResponse);
    setIsMovementBlocked(false);
  }, [serverResponse]);

  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [tileSet, isMovementBlocked, score, isGameOver, isModalShown]);

  useEffect(() => {
    setMaxScore((prevState) => {
      const previousBest = prevState[radius] ?? 0;
      if (finalScore <= previousBest) return prevState;
      return { ...prevState, [radius]: finalScore };
    });
  }, [finalScore, radius]);

  useEffect(() => {
    if (!grid.length || !tileSet.length) return;
    const updatedGrid = [...grid];

    updatedGrid.forEach((block) => {
      if (!isBlocked(block)) block.value = 0;
      block.merged = false;
    });
    tileSet.forEach((tile) => {
      updatedGrid.forEach((block) => {
        if (block.x === tile.x && block.y === tile.y && block.z === tile.z) {
          block.value = tile.value;
          block.id = tile.id;
        }
      });
      tile.merged = false;
    });
    setGrid(updatedGrid);

    if (!validMovementsAvailable(tileSet, grid)) {
      setIsGameOver(true);
      setIsUndoAvailable(false);
      if (qualifiesForHighScore(highScores, radius, finalScore)) {
        setPendingHighScore(true);
      }
    }
  }, [tileSet]);

  useEffect(() => {
    if (undoCount >= maxUndo) {
      setIsMaxUndo(true)
    }
  }, [undoCount, maxUndo])

  useEffect(() => {
    if (isWin && qualifiesForHighScore(highScores, radius, finalScore)) {
      setPendingHighScore(true);
    }
  }, [isWin]);

  useEffect(() => {
    if (isGameOver) {
      clearSavedGame();
      return;
    }
    if (!tileSet.length || !grid.length) return;
    if (!historyTileSet.length) return;
    saveGame({
      tileSet,
      grid,
      score,
      radius,
      historyTileSet,
      historyScore,
      undoCount,
      isUndoAvailable,
      isMaxUndo,
      isWin,
      hasKeptPlaying,
    });
  }, [tileSet, grid, score, radius, historyTileSet, historyScore, undoCount, isUndoAvailable, isMaxUndo, isWin, hasKeptPlaying, isGameOver]);

  const updateTile = (
    tile: gridElement,
    direction: string,
    grid: gridElement[],
    removeTiles: number[],
    mergeCounter: { count: number }
  ): gridElement => {
    const nextBlock = findNextBlock(tile, direction, grid);
    if (nextBlock === false || tile.merged) return tile;

    if (nextBlock.value > 0) {
      if (nextBlock.value === tile.value && !nextBlock.merged) {
        const currentBlock = grid.find(
          (block) =>
            tile.x === block.x && tile.y === block.y && tile.z === block.z
        );
        if (currentBlock) {
          currentBlock.value = 0;
          delete currentBlock.id;
        }
        const newValue = tile.value + nextBlock.value;
        mergeCounter.count += 1;
        const comboMultiplier = mergeCounter.count;
        setScore((prevScore) => prevScore + newValue * comboMultiplier);
        if (!hasKeptPlaying && newValue >= (WIN_TILE_BY_RADIUS[radius] ?? 2048)) setIsWin(true);
        tile.x = nextBlock.x;
        tile.y = nextBlock.y;
        tile.z = nextBlock.z;
        tile.merged = true;
        tile.value = newValue;

        if (nextBlock.id) removeTiles.push(nextBlock.id);
        nextBlock.value = tile.value;
        nextBlock.id = tile.id;
        nextBlock.merged = true;

        return updateTile(tile, direction, grid, removeTiles, mergeCounter);
      } else {
        return tile;
      }
    } else {
      const currentBlock = grid.find(
        (block) =>
          tile.x === block.x && tile.y === block.y && tile.z === block.z
      );
      if (currentBlock) {
        currentBlock.value = 0;
        delete currentBlock.id;
      }
      tile.x = nextBlock.x;
      tile.y = nextBlock.y;
      tile.z = nextBlock.z;
      nextBlock.value = tile.value;
      nextBlock.id = tile.id;

      return updateTile(tile, direction, grid, removeTiles, mergeCounter);
    }
  };

  const updateTilesPos = (direction: string) => {
    if (!validMovementsAvailable(tileSet, grid, [direction])) return;

    setIsMovementBlocked(true);

    const clonedTileSet = structuredClone(tileSet);
    setHistoryTileSet(clonedTileSet);
    setHistoryScore(score);
    if (!isMaxUndo) {
      setIsUndoAvailable(true);
    }

    const tilesToBeRemoved: number[] = [];
    const mergeCounter = { count: 0 };
    const sortedTileSet = sortTileSet(clonedTileSet, direction);
    const updatedTileSet: gridElement[] = sortedTileSet.map((tile) => {
      return updateTile(tile, direction, grid, tilesToBeRemoved, mergeCounter);
    });

    tilesToBeRemoved.forEach((tileId) => {
      updatedTileSet.splice(
        updatedTileSet.map((tile: gridElement) => tile.id).indexOf(tileId),
        1
      );
    });

    setTileSet(updatedTileSet);
    setTimeout(() => {
      restoredRef.current = false;
      fetchTiles(updatedTileSet, radius);
    }, 200);
  };

  useSwipe(boardRef, (direction) => {
    if (isMovementBlocked || isGameOver || isModalShown) return;
    updateTilesPos(direction);
  });

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat || isMovementBlocked || isGameOver || isModalShown) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }
    switch (event.key) {
      case "q":
      case "Q":
        updateTilesPos("northWest");
        break;
      case "w":
      case "W":
        updateTilesPos("north");
        break;
      case "e":
      case "E":
        updateTilesPos("northEast");
        break;
      case "a":
      case "A":
        updateTilesPos("southWest");
        break;
      case "s":
      case "S":
        updateTilesPos("south");
        break;
      case "d":
      case "D":
        updateTilesPos("southEast");
        break;
      case "ArrowUp":
        updateTilesPos("north");
        break;
      case "ArrowDown":
        updateTilesPos("south");
        break;
      case "ArrowLeft":
        updateTilesPos("northWest");
        break;
      case "ArrowRight":
        updateTilesPos("southEast");
        break;
    }
  };

  const resetGameHandler = (newRadius: number): void => {
    setScore(0);
    setIsGameOver(false);
    setIsUndoAvailable(false);
    setUndoCount(0)
    setIsMaxUndo(false)
    setRadius(newRadius);
    setGrid(createHexGrid(newRadius));
    setIsWin(false);
    setHasKeptPlaying(false);
    setIsModalShown(false);
    setPendingHighScore(false);
    setLastQualifyingEntry(null);
    setLastQualifyingRadius(null);
    clearSavedGame();
    saveLastRadius(newRadius);
    restoredRef.current = false;
    fetchTiles([], newRadius);
  };

  const submitHighScore = useCallback(
    async (name: string) => {
      const entry = await submitRemoteHighScore(radius, finalScore, name, undoCount);
      if (entry) {
        setLastQualifyingEntry(entry);
        setLastQualifyingRadius(radius);
      }
      setPendingHighScore(false);
      setIsLeaderboardShown(true);
    },
    [radius, finalScore, undoCount, submitRemoteHighScore]
  );

  const openLeaderboard = useCallback(() => {
    setIsLeaderboardShown(true);
  }, []);

  const dismissOverlay = useCallback(() => {
    setIsWin(false);
    setHasKeptPlaying(true);
  }, []);

  const undoHandler = useCallback(() => {
    setTileSet(historyTileSet);
    setScore(historyScore);
    setIsUndoAvailable(false);
    setUndoCount(prev => prev + 1)
  }, [historyTileSet, historyScore]);

  const onNewGameHandler = useCallback(() => {
    setIsModalShown(true);
  }, []);

  return (
    <>
      {isModalShown && (
        <Modal setIsModalShown={setIsModalShown}>
          <NewGameModal resetGameHandler={resetGameHandler} currentRadius={radius} />
        </Modal>
      )}
      {isLeaderboardShown && (
        <Modal setIsModalShown={setIsLeaderboardShown} title="High Scores">
          <Leaderboard
            scores={highScores}
            highlightRadius={lastQualifyingRadius ?? undefined}
            highlightEntry={lastQualifyingEntry}
            isLoading={isHighScoresLoading}
          />
        </Modal>
      )}
      <div className={styles.wrapper}>
        <GameMenu
          scores={
            <>
              <Score title="Score" score={score} historyScore={historyScore} />
              <Score
                title="My Best"
                score={maxScore?.[radius] ?? 0}
              />
            </>
          }
          isGameOver={isGameOver}
          onNewGameHandler={onNewGameHandler}
          undoHandler={undoHandler}
          isUndoAvailable={isUndoAvailable}
          remainingUndos={maxUndo - undoCount}
          showUndo={maxUndo > 0}
          theme={theme}
          onToggleTheme={toggleTheme}
          onHighScoresHandler={openLeaderboard}
        />
        <Instructions radius={radius} />
        <p className={styles.topScoreLegend}>
          {highScores[radius]?.[0] && (
            <>
              Top score: <strong>{highScores[radius][0].score}</strong> by{" "}
              <strong>{highScores[radius][0].name}</strong>
            </>
          )}
        </p>
        <GameContainer
          ref={boardRef}
          tileSet={sortTileSetById(tileSet)}
          grid={grid}
          radius={radius}
          resetGameHandler={resetGameHandler}
          isGameOver={isGameOver}
          isWin={isWin}
          dismissOverlay={dismissOverlay}
          viewport={viewport}
          pendingHighScore={pendingHighScore}
          score={finalScore}
          baseScore={score}
          noUndoBonus={noUndoBonus}
          noUndoBonusUndos={unusedUndos}
          onSubmitHighScore={submitHighScore}
          beatsHighScore={finalScore > (highScores[radius]?.[LEADERBOARD_SIZE - 1]?.score ?? 0)}
        />
        <footer className={styles.footer}>
          Based on 2048 by{" "}
          <a
            href="https://play2048.co/"
            target="_blank"
            rel="noopener"
          >
            Gabriele Cirulli
          </a>
          {" · v"}{__APP_VERSION__}
        </footer>
      </div>
    </>
  );
};
