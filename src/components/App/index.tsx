import React, { useState, useCallback, useEffect } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import GameContainer from "../GameContainer";
import DevTools from "../DevTools";
import { sortTileSet, findNextBlock, addIds, validMovementsAvailable, sortTileSetById, createHexGrid } from "../../utils";
import { fetchServer } from "./services";
import Score from "../Score";

export const App: React.FC = () => {
  const [radius, setRadius] = useState<number>(2)
  const [grid, setGrid] = useState<gridElement[]>([]);
  const [tileSet, setTileSet] = useState<gridElement[]>([]);
  const [historyTileSet, setHistoryTileSet] = useState<gridElement[]>([]);
  const [isMovementBlocked, setIsMovementBlocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isUndoAvailable, setIsUndoAvailable] = useState(false)
  const [historyScore, setHistoryScore] = useState(0);
  // Dev States
  const [showCoords, setShowCoords] = useState(false);
  const [disableServer, setDisableServer] = useState(false);

  /* 
    Initial component mount
  */
    useEffect(() => {
      setGrid(createHexGrid(radius));
      serverCall();
    }, []);

  /* 
    Add event listener to the document
  */
  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [tileSet, isMovementBlocked, disableServer, score, isGameOver]);

  /* 
    Side-effect on Tile Set
  */
  useEffect(() => {
    if (!grid.length) return;
    const updatedGrid = [...grid];

    // Me must clear and update the [data-values] on the grid 
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
      tile.merged = false
    });
    setGrid(updatedGrid);
      
    // We must check if it is possible to keep moving on the grid
    if(!validMovementsAvailable(tileSet, grid)) setIsGameOver(true);

  }, [tileSet]);


  const serverCall = async (tileSet: gridElement[] = []) => {
    if (disableServer) return setIsMovementBlocked(false);
      
    const serverResponseData = await fetchServer(tileSet, radius+1);
    setIsMovementBlocked(false);
    if (!serverResponseData?.length) return;
    
    const updatedTileSet = [...addIds(serverResponseData), ...tileSet]
    setTileSet(updatedTileSet);
  };

  const updateTile = (tile: gridElement, direction: string, grid: gridElement[], removeTiles: number[]): any => {
    const nextBlock = findNextBlock(tile, direction, grid);
    if (nextBlock === false || tile.merged) return tile;

    if (nextBlock && nextBlock.value) {
      if (nextBlock.value === tile.value && !nextBlock.merged) {
        const currentBlock = grid.find((block) => tile.x === block.x && tile.y === block.y && tile.z === block.z);
        if(currentBlock){
          currentBlock.value = 0;
          delete currentBlock.id;
        }
        setScore((prevScore) => prevScore + (tile.value + nextBlock.value));
        tile.x = nextBlock.x;
        tile.y = nextBlock.y;
        tile.z = nextBlock.z;
        tile.merged = true;
        tile.value = tile.value + nextBlock.value;
        
        if (nextBlock.id) removeTiles.push(nextBlock.id);
        nextBlock.value = tile.value;
        nextBlock.id = tile.id;
        nextBlock.merged = true;
       
        return updateTile(tile, direction, grid, removeTiles);
      } else {
        return tile;
      }
    } else {
      const currentBlock = grid.find((block) => tile.x === block.x && tile.y === block.y && tile.z === block.z);
      if(currentBlock){
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
    if(!validMovementsAvailable(tileSet, grid, [direction])) return;
    
    setIsMovementBlocked(true);

    const clonedTileSet = structuredClone(tileSet)
    setHistoryTileSet(clonedTileSet)
    setHistoryScore(score)
    setIsUndoAvailable(true)

    const tilesToBeRemoved: number[] = [];
    const sortedTileSet = sortTileSet(clonedTileSet, direction);
    const updatedTileSet: gridElement[] = sortedTileSet.map((tile) => {
      return updateTile(tile, direction, grid, tilesToBeRemoved);
    });

    // After merge two tiles of the same value we must remove one of them
    tilesToBeRemoved.forEach((tileId) => {
      updatedTileSet.splice(updatedTileSet.map((tile: gridElement) => tile.id).indexOf(tileId), 1);
    });

    setTileSet(updatedTileSet);
    setTimeout(() => {
      serverCall(updatedTileSet);
    }, 200);
  };

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat || isMovementBlocked || isGameOver) return;
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
      case "f":
      case "F":
        break;
    }
  };

  const resetGameHandler = useCallback(() => {
    setScore(0);
    setIsGameOver(false);
    setIsUndoAvailable(false)
    serverCall([]);
  }, []);
  
  const undoHandler = useCallback(() => {
    setTileSet(historyTileSet);
    setScore(historyScore);
    setIsUndoAvailable(false)
  }, [historyTileSet]);

  return (
    <div className={styles.wrapper} >
      <section className={styles.scoreWrapper}>
        <div className={styles.scoreContainer}>
          <Score title="Score" score={score} historyScore={historyScore}/>
          <Score title="Best" score={0}/>
        </div>
        </section>
      {/* Dev Tools */}
      <DevTools showCoords={showCoords} setShowCoords={setShowCoords} disableServer={disableServer} setDisableServer={setDisableServer}/>
      {/* Game Menu */}
      <GameMenu isGameOver={isGameOver} score={score} historyScore={historyScore} resetGameHandler={resetGameHandler} undoHandler={undoHandler} isUndoAvailable={isUndoAvailable}/>
      {/* Game */}
      <GameContainer tileSet={sortTileSetById(tileSet)} grid={grid} radius={radius} resetGameHandler={resetGameHandler} isGameOver={isGameOver} showCoords={showCoords} />
      {/* Instructions */}
      <Instructions />
    </div>
  );
};
