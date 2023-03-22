import React, { useState, useRef, useEffect } from "react";
import styles from "./App.module.css";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import GameContainer from "../GameContainer";
import DevTools from "../DevTools";
import { sortTileSet, findNextBlock, addIds, hardcodedGrid } from "./utils";
import { fetchServer } from "./services";

export const App: React.FC = () => {
  const [grid, setGrid] = useState<gridElement[]>([]);
  const [tileSet, setTileSet] = useState<gridElement[]>([]);
  const [isMoveBlocked, setIsMoveBlocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [firstCall, setFirstCall] = useState(true);
  const [score, setScore] = useState(0);
  // Dev States
  const [showCoords, setShowCoords] = useState(false);
  const [disableServer, setDisableServer] = useState(false);

  /* 
    Add event listener to the document
  */
  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [tileSet, isMoveBlocked, disableServer, score]);

  /* 
    Initial component mount
  */
  useEffect(() => {
    setGrid(hardcodedGrid);
    serverCall();
  }, []);

  /* 
    Side-effect on Tile Set
  */
  useEffect(() => {
    if (!grid.length) return;
    const updatedGrid = [...grid];

    // Me must clear and update the [data-values] on the grid 
    updatedGrid.forEach((block) => (block.value = 0, block.merged = false));
    tileSet.forEach((tile) => (tile.merged = false));

    tileSet.forEach((serverCoords) => {
      updatedGrid.forEach((gridCoords) => {
        if (gridCoords.x === serverCoords.x && gridCoords.y === serverCoords.y && gridCoords.z === serverCoords.z) {
          gridCoords.value = serverCoords.value;
          gridCoords.id = serverCoords.id;
        }
      });
    });
      setGrid(updatedGrid);
  }, [tileSet]);


  const serverCall = async (newTileSet: gridElement[] = []) => {
    if (disableServer){
      setIsMoveBlocked(false);
      return;
    } 
    const serverResponseData = await fetchServer(newTileSet);
    if (!serverResponseData?.length && !firstCall) {
      setGameOver(true);
      return;
    }
    setFirstCall(false);
    setTileSet([...addIds(serverResponseData), ...newTileSet]);
    setIsMoveBlocked(false);
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
    setIsMoveBlocked(true);

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
    if (event.repeat || isMoveBlocked || gameOver) return;
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

  const resetGameHandler = async () => {
    setTileSet([]);
    setScore(0);
    await serverCall([]);
  };

  if (!setTileSet.length) return <></>;

  return (
    <div className={styles.wrapper} >
      {/* Dev Tools */}
      <DevTools showCoords={showCoords} setShowCoords={setShowCoords} disableServer={disableServer} setDisableServer={setDisableServer}/>
      {/* Game Menu */}
      <GameMenu resetGameHandler={resetGameHandler} gameOver={gameOver} score={score} />
      {/* Game */}
      <GameContainer tileSet={tileSet} grid={grid} showCoords={showCoords}/>
      {/* Instructions */}
      <Instructions />
    </div>
  );
};
