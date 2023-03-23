import React, { useState, useCallback, useEffect } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import GameContainer from "../GameContainer";
import DevTools from "../DevTools";
import { sortTileSet, findNextBlock, addIds, hardcodedGrid, validMovementsLeft, sortTileSetById } from "./utils";
import { fetchServer } from "./services";

export const App: React.FC = () => {
  const [grid, setGrid] = useState<gridElement[]>([]);
  const [tileSet, setTileSet] = useState<gridElement[]>([]);
  const [isMovementBlocked, setIsMovementBlocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  // Dev States
  const [showCoords, setShowCoords] = useState(false);
  const [disableServer, setDisableServer] = useState(false);

  /* 
    Initial component mount
  */
    useEffect(() => {
      setGrid(hardcodedGrid);
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
    if(!validMovementsLeft(tileSet, grid)) setIsGameOver(true);

  }, [tileSet]);


  const serverCall = async (tileSet: gridElement[] = []) => {
    if (disableServer) return setIsMovementBlocked(false);
      
    const serverResponseData = await fetchServer(tileSet);
    setIsMovementBlocked(false);
    if (!serverResponseData?.length) return;
    
    const updatedTileSet = [...addIds(serverResponseData), ...tileSet]
    setTileSet(updatedTileSet);
  };

  const updateTile = (tile: gridElement, direction: string, grid: gridElement[], removeTiles: number[]): gridElement => {
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
    setIsMovementBlocked(true);

    const tilesToBeRemoved: number[] = [];
    const sortedTileSet = sortTileSet([...tileSet], direction);
    const updatedTileSet: gridElement[] = sortedTileSet.map((tile) => {
      return updateTile(tile, direction, [...grid], tilesToBeRemoved);
    });

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
    serverCall([]);
  }, [serverCall]);

  return (
    <div className={styles.wrapper} >
      {/* Dev Tools */}
      <DevTools showCoords={showCoords} setShowCoords={setShowCoords} disableServer={disableServer} setDisableServer={setDisableServer}/>
      {/* Game Menu */}
      <GameMenu resetGameHandler={resetGameHandler} isGameOver={isGameOver} score={score} />
      {/* Game */}
      <GameContainer tileSet={sortTileSetById(tileSet)} grid={grid} resetGameHandler={resetGameHandler} isGameOver={isGameOver} showCoords={showCoords} />
      {/* Instructions */}
      <Instructions />
    </div>
  );
};
