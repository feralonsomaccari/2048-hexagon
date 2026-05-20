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

const MAX_UNDO_BY_RADIUS: Record<number, number> = { 1: 3, 2: 1, 3: 0, 4: 0 };

export const App: React.FC = () => {
  const [isModalShown, setIsModalShown] = useState(false);
  const [radius, setRadius] = useState(1);
  const [grid, setGrid] = useState<gridElement[]>([]);
  const [tileSet, setTileSet] = useState<gridElement[]>([]);
  const [historyTileSet, setHistoryTileSet] = useState<gridElement[]>([]);
  const [isMovementBlocked, setIsMovementBlocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [score, setScore] = useState(0);
  const [isUndoAvailable, setIsUndoAvailable] = useState(false);
  const [undoCount, setUndoCount] = useState(0)
  const [isMaxUndo, setIsMaxUndo] = useState(false)
  const [historyScore, setHistoryScore] = useState(0);
  const [maxScore, setMaxScore] = useLocalStorage<Record<string, number>>("maxScore", { 1: 0 });
  const { scores: highScores, submit: submitRemoteHighScore, isLoading: isHighScoresLoading } = useRemoteHighScores();
  const [isLeaderboardShown, setIsLeaderboardShown] = useState(false);
  const [pendingHighScore, setPendingHighScore] = useState(false);
  const [lastQualifyingEntry, setLastQualifyingEntry] = useState<HighScoreEntry | null>(null);
  const [lastQualifyingRadius, setLastQualifyingRadius] = useState<number | null>(null);
  const [serverResponse, fetchTiles] = useGameTiles([], 1);
  const [theme, toggleTheme] = useTheme();
  const viewport = useViewport();
  const boardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setGrid(createHexGrid(radius));
  }, []);

  useEffect(() => {
    const legacyValue = (maxScore as unknown as { value?: number }).value;
    if (typeof legacyValue === "number") {
      setMaxScore({ 1: legacyValue });
    }
  }, []);

  useEffect(() => {
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
      if (score <= previousBest) return prevState;
      return { ...prevState, [radius]: score };
    });
  }, [score, radius]);

  useEffect(() => {
    if (!grid.length || !tileSet.length) return;
    const updatedGrid = [...grid];

    updatedGrid.forEach((block) => {
      block.value = 0;
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
      if (qualifiesForHighScore(highScores, radius, score)) {
        setPendingHighScore(true);
      }
    }
  }, [tileSet]);

  const maxUndo = MAX_UNDO_BY_RADIUS[radius] ?? 0;

  useEffect(() => {
    if (undoCount >= maxUndo) {
      setIsMaxUndo(true)
    }
  }, [undoCount, maxUndo])

  useEffect(() => {
    if (isWin && qualifiesForHighScore(highScores, radius, score)) {
      setPendingHighScore(true);
    }
  }, [isWin]);

  const updateTile = (
    tile: gridElement,
    direction: string,
    grid: gridElement[],
    removeTiles: number[]
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
        setScore((prevScore) => prevScore + newValue);
        if (newValue >= 2048) setIsWin(true);
        tile.x = nextBlock.x;
        tile.y = nextBlock.y;
        tile.z = nextBlock.z;
        tile.merged = true;
        tile.value = newValue;

        if (nextBlock.id) removeTiles.push(nextBlock.id);
        nextBlock.value = tile.value;
        nextBlock.id = tile.id;
        nextBlock.merged = true;

        return updateTile(tile, direction, grid, removeTiles);
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

      return updateTile(tile, direction, grid, removeTiles);
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
    const sortedTileSet = sortTileSet(clonedTileSet, direction);
    const updatedTileSet: gridElement[] = sortedTileSet.map((tile) => {
      return updateTile(tile, direction, grid, tilesToBeRemoved);
    });

    tilesToBeRemoved.forEach((tileId) => {
      updatedTileSet.splice(
        updatedTileSet.map((tile: gridElement) => tile.id).indexOf(tileId),
        1
      );
    });

    setTileSet(updatedTileSet);
    setTimeout(() => {
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
    setIsModalShown(false);
    setPendingHighScore(false);
    setLastQualifyingEntry(null);
    setLastQualifyingRadius(null);
    fetchTiles([], newRadius);
  };

  const submitHighScore = useCallback(
    async (name: string) => {
      const entry = await submitRemoteHighScore(radius, score, name);
      if (entry) {
        setLastQualifyingEntry(entry);
        setLastQualifyingRadius(radius);
      }
      setPendingHighScore(false);
      setIsLeaderboardShown(true);
    },
    [radius, score, submitRemoteHighScore]
  );

  const openLeaderboard = useCallback(() => {
    setIsLeaderboardShown(true);
  }, []);

  const dismissOverlay = useCallback(() => {
    setIsWin(false);
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
                title="Best"
                score={highScores[radius]?.[0]?.score ?? maxScore?.[radius] ?? 0}
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
        <Instructions />
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
          score={score}
          onSubmitHighScore={submitHighScore}
          beatsHighScore={score > (highScores[radius]?.[2]?.score ?? 0)}
        />
        <footer className={styles.footer}>
          Made by{" "}
          <a
            href="https://feralonsomaccari.github.io/my-portfolio/"
            target="_blank"
            rel="author noopener"
          >
            feralonsomaccari
          </a>
          {" · Based on 2048 by "}
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
