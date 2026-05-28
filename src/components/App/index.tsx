import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import GameContainer from "../GameContainer";
import PowerUpBar from "../PowerUpBar";
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
import useSound from "../../hooks/useSound";
import useRemoteHighScores from "../../hooks/useRemoteHighScores";
import {
  loadSavedGame,
  saveGame,
  clearSavedGame,
  loadLastRadius,
  saveLastRadius,
} from "../../utils/savedGameStorage";
import { DEFAULT_RADIUS, LEADERBOARD_SIZE, MAX_REMOVE_BY_RADIUS, MAX_UNDO_BY_RADIUS, NO_UNDO_BONUS_RATE_PER_UNDO, WIN_TILE_BY_RADIUS } from "../../config/gameConfig";

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

  const [bankedBonus, setBankedBonus] = useState<number | null>(initialSavedGame?.bankedBonus ?? null);
  const [score, setScore] = useState(initialSavedGame?.score ?? 0);

  const [comboBonus, setComboBonus] = useState(initialSavedGame?.comboBonus ?? 0);
  const [isUndoAvailable, setIsUndoAvailable] = useState(initialSavedGame?.isUndoAvailable ?? false);
  const [undoCount, setUndoCount] = useState(initialSavedGame?.undoCount ?? 0)
  const [movesCount, setMovesCount] = useState(initialSavedGame?.movesCount ?? 0)
  const [isMaxUndo, setIsMaxUndo] = useState(initialSavedGame?.isMaxUndo ?? false)
  const [removeCount, setRemoveCount] = useState(initialSavedGame?.removeCount ?? 0)
  const [isRemoveMode, setIsRemoveMode] = useState(false)
  const [historyScore, setHistoryScore] = useState(initialSavedGame?.historyScore ?? 0);
  const [historyComboBonus, setHistoryComboBonus] = useState(initialSavedGame?.historyComboBonus ?? 0);
  const [maxScore, setMaxScore] = useLocalStorage<Record<string, number>>("maxScore", { 2: 0 });
  const { scores: highScores, submit: submitRemoteHighScore, isLoading: isHighScoresLoading, isRemote: isHighScoresRemote } = useRemoteHighScores();
  const [isLeaderboardShown, setIsLeaderboardShown] = useState(false);
  const [pendingHighScore, setPendingHighScore] = useState(false);
  const [lastQualifyingEntry, setLastQualifyingEntry] = useState<HighScoreEntry | null>(null);
  const [lastQualifyingRadius, setLastQualifyingRadius] = useState<number | null>(null);
  const [serverResponse, fetchTiles] = useGameTiles([], initialRadius);
  const [theme, toggleTheme] = useTheme();
  const { isMuted, toggleMuted, play } = useSound();
  const viewport = useViewport();
  const boardRef = useRef<HTMLElement>(null);
  const restoredRef = useRef<boolean>(!!initialSavedGame);

  const playedWinRef = useRef<boolean>(initialSavedGame?.isWin ?? false);
  const playedGameOverRef = useRef<boolean>(false);

  const mergeStreakRef = useRef<number>(0);

  const maxUndo = MAX_UNDO_BY_RADIUS[radius] ?? 0;
  const maxRemove = MAX_REMOVE_BY_RADIUS[radius] ?? 0;
  const removesRemaining = Math.max(0, maxRemove - removeCount);

  const unusedUndos = Math.max(0, maxUndo - undoCount);
  const liveBonus = Math.round(score * NO_UNDO_BONUS_RATE_PER_UNDO * unusedUndos);

  const noUndoBonus = bankedBonus ?? liveBonus;
  const finalScore = score + noUndoBonus;

  const SHARE_URL = "https://2048hexagon.com";

  const canPromptHighScore = (qualifyingScore: number): boolean => {
    if (isHighScoresRemote && (isHighScoresLoading || highScores[radius] === undefined)) {
      return false;
    }
    return qualifiesForHighScore(highScores, radius, qualifyingScore);
  };

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
  }, [tileSet, isMovementBlocked, score, isGameOver, isWin, isModalShown, isRemoveMode]);

  useEffect(() => {
    if (!isRemoveMode) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsRemoveMode(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isRemoveMode]);

  useEffect(() => {
    if (isGameOver || isWin) setIsRemoveMode(false);
  }, [isGameOver, isWin]);

  const displayedScore = bankedBonus !== null ? finalScore : score;
  useEffect(() => {
    setMaxScore((prevState) => {
      const previousBest = prevState[radius] ?? 0;
      if (displayedScore <= previousBest) return prevState;
      return { ...prevState, [radius]: displayedScore };
    });
  }, [displayedScore, radius]);

  useEffect(() => {
    if (!isGameOver && !isWin) return;
    setMaxScore((prevState) => {
      const previousBest = prevState[radius] ?? 0;
      if (finalScore <= previousBest) return prevState;
      return { ...prevState, [radius]: finalScore };
    });
  }, [isGameOver, isWin, finalScore, radius]);

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
      if (!playedGameOverRef.current) {
        playedGameOverRef.current = true;
        play("gameOver");
      }
    }
  }, [tileSet]);

  useEffect(() => {
    if (undoCount >= maxUndo) {
      setIsMaxUndo(true)
    }
  }, [undoCount, maxUndo])

  useEffect(() => {
    if (!isWin) return;
    if (!playedWinRef.current) {
      playedWinRef.current = true;
      play("win");
    }

    setBankedBonus(liveBonus);
  }, [isWin]);

  useEffect(() => {
    if (!isGameOver && !isWin) return;
    if (pendingHighScore) return;
    if (canPromptHighScore(finalScore)) {
      setPendingHighScore(true);
    }
  }, [isGameOver, isWin, finalScore, highScores, isHighScoresLoading, isHighScoresRemote, radius, pendingHighScore]);

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
      comboBonus,
      radius,
      historyTileSet,
      historyScore,
      historyComboBonus,
      undoCount,
      isUndoAvailable,
      isMaxUndo,
      removeCount,
      isWin,
      hasKeptPlaying,
      bankedBonus: bankedBonus ?? undefined,
      movesCount,
    });
  }, [tileSet, grid, score, comboBonus, radius, historyTileSet, historyScore, historyComboBonus, undoCount, isUndoAvailable, isMaxUndo, removeCount, isWin, hasKeptPlaying, bankedBonus, isGameOver, movesCount]);

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

        if (comboMultiplier > 1) {
          setComboBonus((prev) => prev + newValue * (comboMultiplier - 1));
        }
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
    setMovesCount((prev) => prev + 1);

    const clonedTileSet = structuredClone(tileSet);
    setHistoryTileSet(clonedTileSet);
    setHistoryScore(score);
    setHistoryComboBonus(comboBonus);
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

    if (mergeCounter.count === 0) {
      mergeStreakRef.current = 0;
      play("move");
    } else {
      mergeStreakRef.current += 1;
      play("merge", { streak: mergeStreakRef.current });
      if (mergeCounter.count >= 2) play("combo", { combo: mergeCounter.count });
    }

    setTileSet(updatedTileSet);
    setTimeout(() => {
      restoredRef.current = false;
      fetchTiles(updatedTileSet, radius);
    }, 200);
  };

  useSwipe(boardRef, (direction) => {
    if (isMovementBlocked || isGameOver || isWin || isModalShown || isRemoveMode) return;
    updateTilesPos(direction);
  });

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat || isMovementBlocked || isGameOver || isWin || isModalShown || isRemoveMode) return;
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
    setComboBonus(0);
    setHistoryComboBonus(0);
    setIsGameOver(false);
    setIsUndoAvailable(false);
    setUndoCount(0)
    setMovesCount(0)
    setIsMaxUndo(false)
    setRemoveCount(0)
    setIsRemoveMode(false)
    setRadius(newRadius);
    setGrid(createHexGrid(newRadius));
    setIsWin(false);
    setHasKeptPlaying(false);
    setBankedBonus(null);
    setIsModalShown(false);
    setPendingHighScore(false);
    setLastQualifyingEntry(null);
    setLastQualifyingRadius(null);
    playedWinRef.current = false;
    playedGameOverRef.current = false;
    mergeStreakRef.current = 0;
    clearSavedGame();
    saveLastRadius(newRadius);
    restoredRef.current = false;
    fetchTiles([], newRadius);
  };

  const submitHighScore = useCallback(
    async (name: string) => {
      const entry = await submitRemoteHighScore(radius, finalScore, name, {
        undosUsed: undoCount,
        comboBonus,
        noUndoBonus,
        movesCount,
      });
      if (entry) {
        setLastQualifyingEntry(entry);
        setLastQualifyingRadius(radius);
      }
      setPendingHighScore(false);
      setIsLeaderboardShown(true);
    },
    [radius, finalScore, undoCount, comboBonus, noUndoBonus, movesCount, submitRemoteHighScore]
  );

  const openLeaderboard = useCallback(() => {
    setIsLeaderboardShown(true);
  }, []);

  const dismissOverlay = useCallback(() => {
    setIsWin(false);
    setHasKeptPlaying(true);
  }, []);

  const handleTryAgain = useCallback(() => {
    resetGameHandler(radius);
  }, [radius]);

  const buildShareText = useCallback(() => {
    const target = WIN_TILE_BY_RADIUS[radius] ?? 2048;
    const headline = isWin
      ? `I reached ${target} on 2048 Hexagon with ${displayedScore} points in ${movesCount} move${movesCount === 1 ? "" : "s"}!`
      : `I'm playing 2048 Hexagon — ${displayedScore} points and counting!`;
    return `${headline} Can you beat me?`;
  }, [radius, isWin, displayedScore, movesCount]);

  const shareOnTwitter = useCallback(() => {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }, [buildShareText]);

  const shareOnFacebook = useCallback(() => {
    const intent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }, []);

  const undoHandler = useCallback(() => {

    if (isWin || isGameOver) return;
    setTileSet(historyTileSet);
    setScore(historyScore);
    setComboBonus(historyComboBonus);
    setIsUndoAvailable(false);
    setUndoCount(prev => prev + 1)
  }, [historyTileSet, historyScore, historyComboBonus, isWin, isGameOver]);

  const toggleRemoveMode = useCallback(() => {
    if (isWin || isGameOver || isMovementBlocked || movesCount === 0) return;
    setIsRemoveMode((prev) => !prev);
  }, [isWin, isGameOver, isMovementBlocked, movesCount]);

  const removeTileHandler = useCallback((tile: gridElement) => {
    setTileSet((prev) => prev.filter((t) => t.id !== tile.id));
    setRemoveCount((prev) => prev + 1);
    setIsRemoveMode(false);
    play("move");
  }, [play]);

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
              <Score
                title="Score"
                score={isGameOver ? finalScore : displayedScore}
              />
              <Score
                title="My Best"
                score={maxScore?.[radius] ?? 0}
              />
            </>
          }
          topScore={
            highScores[radius]?.[0] ? (
              <>
                Top score: <strong>{highScores[radius][0].score}</strong> by{" "}
                <strong>{highScores[radius][0].name}</strong>
              </>
            ) : undefined
          }
          theme={theme}
          onToggleTheme={toggleTheme}
          onHighScoresHandler={openLeaderboard}
          isMuted={isMuted}
          onToggleMuted={toggleMuted}
          onShareTwitter={shareOnTwitter}
          onShareFacebook={shareOnFacebook}
          isWin={isWin}
        />
        <Instructions radius={radius} collapsed={isWin} />
        <GameContainer
          ref={boardRef}
          tileSet={sortTileSetById(tileSet)}
          grid={grid}
          radius={radius}
          resetGameHandler={resetGameHandler}
          onTryAgain={handleTryAgain}
          isGameOver={isGameOver}
          isWin={isWin}
          dismissOverlay={dismissOverlay}
          viewport={viewport}
          pendingHighScore={pendingHighScore}
          score={finalScore}
          baseScore={score}
          comboBonus={comboBonus}
          noUndoBonus={noUndoBonus}
          noUndoBonusUndos={unusedUndos}
          movesCount={movesCount}
          onSubmitHighScore={submitHighScore}
          beatsHighScore={finalScore > (highScores[radius]?.[LEADERBOARD_SIZE - 1]?.score ?? 0)}
          isRemoveMode={isRemoveMode}
          onRemoveTile={removeTileHandler}
        />
        {!isWin && (
          <PowerUpBar
            powerUps={{
              ...(maxUndo > 0
                ? {
                    undo: {
                      onActivate: undoHandler,
                      disabled: !isUndoAvailable || isGameOver || isRemoveMode,
                      charges: maxUndo - undoCount,
                      maxCharges: maxUndo,
                    },
                  }
                : {}),
              ...(maxRemove > 0
                ? {
                    removeTile: {
                      onActivate: toggleRemoveMode,
                      disabled: isGameOver || movesCount === 0,
                      charges: removesRemaining,
                      maxCharges: maxRemove,
                      active: isRemoveMode,
                    },
                  }
                : {}),
              newGame: {
                onActivate: onNewGameHandler,
              },
            }}
          />
        )}
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
