import React, { useState, useCallback, useEffect } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import GameContainer from "../GameContainer";
import Score from "../Score";
import NewGameModal from "../NewGameMenu";
import Modal from "../Modal";
import {
  sortTileSet,
  findNextBlock,
  validMovementsAvailable,
  sortTileSetById,
  createHexGrid,
} from "../../utils/gameLogic";
import useLocalStorage from "../../hooks/useLocalStorage";
import useGameTiles from "../../hooks/useGameTiles";
import useWindowScale from "../../hooks/useWindowScale";

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
  const [historyScore, setHistoryScore] = useState(0);
  const [maxScore, setMaxScore] = useLocalStorage<{ value: number }>("maxScore", { value: 0 });
  const [serverResponse, fetchTiles] = useGameTiles([], 1);
  const windowScale = useWindowScale();

  useEffect(() => {
    setGrid(createHexGrid(radius));
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
    setMaxScore((prevState) => ({
      value: score > prevState.value ? score : prevState.value,
    }));
  }, [score]);

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
    }
  }, [tileSet]);

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
    setIsUndoAvailable(true);

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

  const resetGameHandler = (radius: number): void => {
    setScore(0);
    setIsGameOver(false);
    setIsUndoAvailable(false);
    setRadius(radius);
    setGrid(createHexGrid(radius));
    setIsWin(false);
    setIsModalShown(false);
    fetchTiles([]);
  };

  const dismissOverlay = useCallback(() => {
    setIsWin(false);
  }, []);

  const undoHandler = useCallback(() => {
    setTileSet(historyTileSet);
    setScore(historyScore);
    setIsUndoAvailable(false);
  }, [historyTileSet, historyScore]);

  const onNewGameHandler = useCallback(() => {
    setIsModalShown(true);
  }, []);

  return (
    <>
      {isModalShown && (
        <Modal setIsModalShown={setIsModalShown}>
          <NewGameModal resetGameHandler={resetGameHandler} />
        </Modal>
      )}
      <div className={styles.wrapper}>
        <GameMenu
          scores={
            <>
              <Score title="Score" score={score} historyScore={historyScore} />
              <Score title="Best" score={maxScore?.value} />
            </>
          }
          isGameOver={isGameOver}
          onNewGameHandler={onNewGameHandler}
          undoHandler={undoHandler}
          isUndoAvailable={isUndoAvailable}
        />
        <Instructions />
        <GameContainer
          tileSet={sortTileSetById(tileSet)}
          grid={grid}
          radius={radius}
          resetGameHandler={resetGameHandler}
          isGameOver={isGameOver}
          isWin={isWin}
          dismissOverlay={dismissOverlay}
          windowScale={windowScale}
        />
      </div>
    </>
  );
};
