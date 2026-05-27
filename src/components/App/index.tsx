import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
// import Instructions from "../Instructions"; // hidden for now
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
import useSound from "../../hooks/useSound";
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
  // No-undo bonus banked at the moment of the first win. Once won, the bonus is
  // locked to this fixed amount and stays applied through "Keep Playing" (it no
  // longer shrinks if an undo is used afterwards). `null` until a win banks it,
  // which is distinct from a banked value of 0 (won with all undos used).
  const [bankedBonus, setBankedBonus] = useState<number | null>(initialSavedGame?.bankedBonus ?? null);
  const [score, setScore] = useState(initialSavedGame?.score ?? 0);
  // Portion of `score` earned from chained merges (combos). The first merge in a
  // move scores at ×1 (no combo bonus); each further merge in the same move
  // scores at ×2, ×3, … and the extra above the base value is banked here so we
  // can break it out at game-end.
  const [comboBonus, setComboBonus] = useState(initialSavedGame?.comboBonus ?? 0);
  const [isUndoAvailable, setIsUndoAvailable] = useState(initialSavedGame?.isUndoAvailable ?? false);
  const [undoCount, setUndoCount] = useState(initialSavedGame?.undoCount ?? 0)
  const [isMaxUndo, setIsMaxUndo] = useState(initialSavedGame?.isMaxUndo ?? false)
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
  // Guards so end-of-game sounds fire on the in-session transition only, not
  // when a finished/won game is restored from storage on page load.
  const playedWinRef = useRef<boolean>(initialSavedGame?.isWin ?? false);
  const playedGameOverRef = useRef<boolean>(false);
  // Consecutive moves that merged. Drives the rising merge pitch; resets to 0
  // when a move makes no merge (the streak "breaks").
  const mergeStreakRef = useRef<number>(0);

  const maxUndo = MAX_UNDO_BY_RADIUS[radius] ?? 0;

  // No-undo bonus: scales with the undos left *unused*. Each undo you decline
  // is worth NO_UNDO_BONUS_RATE_PER_UNDO of the score, so the bonus is
  // (maxUndo - undoCount) × rate. Small board: 0 used → +30%, 1 → +20%,
  // 2 → +10%, 3 → +0%. Normal board: 0 used → +10%, 1 → +0%.
  const unusedUndos = Math.max(0, maxUndo - undoCount);
  const liveBonus = Math.round(score * NO_UNDO_BONUS_RATE_PER_UNDO * unusedUndos);
  // Once a win has banked the bonus, it's locked to that fixed amount and stays
  // applied (through "Keep Playing", and a later Game Over too). Before banking
  // — a plain Game Over, or the brief win render before the bank effect runs —
  // it's the live, submit-time value.
  const noUndoBonus = bankedBonus ?? liveBonus;
  const finalScore = score + noUndoBonus;

  // Whether a finished run should prompt for the player's name. Beyond the raw
  // score check, the leaderboard for this board must have actually loaded:
  // while a remote leaderboard is still loading (or the radius's snapshot hasn't
  // arrived yet), `highScores[radius]` looks empty and every positive score
  // would falsely qualify — which is how the prompt could appear for scores
  // outside the top N. Once not loading, an absent list means there genuinely
  // are no entries yet (or no remote configured), so any score legitimately
  // qualifies.
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
  }, [tileSet, isMovementBlocked, score, isGameOver, isWin, isModalShown]);

  // During play, "My Best" follows the on-screen "Score" so it never lags or
  // leaps ahead of it: the raw score before a win, and the banked-bonus total
  // (`finalScore`) once a win has locked the bonus in (e.g. while keeping play).
  const displayedScore = bankedBonus !== null ? finalScore : score;
  useEffect(() => {
    setMaxScore((prevState) => {
      const previousBest = prevState[radius] ?? 0;
      if (displayedScore <= previousBest) return prevState;
      return { ...prevState, [radius]: displayedScore };
    });
  }, [displayedScore, radius]);

  // At end-of-run, bump "My Best" up to the bonus-adjusted final score (score ×
  // rate × unused undos) so it matches what gets submitted to the leaderboard.
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
      isWin,
      hasKeptPlaying,
      bankedBonus: bankedBonus ?? undefined,
    });
  }, [tileSet, grid, score, comboBonus, radius, historyTileSet, historyScore, historyComboBonus, undoCount, isUndoAvailable, isMaxUndo, isWin, hasKeptPlaying, bankedBonus, isGameOver]);

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
        // The base value counts once at ×1; anything above that (×2, ×3, … on
        // chained merges) is the combo bonus.
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

    // One cue for the move as a whole. No merge: a soft slide, and the merge
    // streak breaks (pitch will restart next time). A merge: bump the streak and
    // play a single blip whose pitch rises the longer the run goes, regardless
    // of how many tiles merged this move. A combo flourish layers on for chains
    // of two or more.
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
    if (isMovementBlocked || isGameOver || isWin || isModalShown) return;
    updateTilesPos(direction);
  });

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat || isMovementBlocked || isGameOver || isWin || isModalShown) return;
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
    setIsMaxUndo(false)
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
      });
      if (entry) {
        setLastQualifyingEntry(entry);
        setLastQualifyingRadius(radius);
      }
      setPendingHighScore(false);
      setIsLeaderboardShown(true);
    },
    [radius, finalScore, undoCount, comboBonus, noUndoBonus, submitRemoteHighScore]
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
    setComboBonus(historyComboBonus);
    setIsUndoAvailable(false);
    setUndoCount(prev => prev + 1)
  }, [historyTileSet, historyScore, historyComboBonus]);

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
                historyScore={historyScore}
                gain={score - historyScore}
              />
              <Score
                title="My Best"
                score={maxScore?.[radius] ?? 0}
              />
            </>
          }
          onNewGameHandler={onNewGameHandler}
          undoHandler={undoHandler}
          isUndoAvailable={isUndoAvailable}
          remainingUndos={maxUndo - undoCount}
          maxUndos={maxUndo}
          showUndo={maxUndo > 0}
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
        />
        {/* "How to Play" instructions hidden for now. */}
        {/* <Instructions radius={radius} /> */}
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
          comboBonus={comboBonus}
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
