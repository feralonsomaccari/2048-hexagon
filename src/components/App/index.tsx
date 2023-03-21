import React, { useState, useRef, useEffect } from "react";
import Block from "../Block";
import Tile from "../Tile";
import styles from "./App.module.css";
import { getPositionFromCoordinates, moveTile, sortTileSet, hardcodedGrid } from "./utils";
import GameMenu from "../GameMenu";
import Instructions from "../Instructions";
import { fetchServer } from "./services";

export const App: React.FC = () => {
  const [grid, setGrid] = useState<gridElement[]>([]);
  const [tileSet, setTileSet] = useState<gridElement[]>([]);
  const [moving, setMoving] = useState(false);
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
  }, [tileSet, moving, disableServer, score]);

  /* 
    Initial component mount
  */
  useEffect(() => {
    const tempGrid = [...hardcodedGrid];
    tempGrid.forEach((serverCoords) => (serverCoords.value = 0));
    setGrid(tempGrid);
    serverCall();
  }, []);

  /* 
    Side-effect on Tile Set
  */
  useEffect(() => {
    if (grid.length) {
      const tempGrid = [...grid];

      tempGrid.forEach((serverCoords) => (serverCoords.value = 0));

      tileSet.forEach((serverCoords) => {
        tempGrid.forEach((gridCoords) => {
          if (gridCoords.x === serverCoords.x && gridCoords.y === serverCoords.y && gridCoords.z === serverCoords.z) {
            gridCoords.value = serverCoords.value;
            gridCoords.id = serverCoords.id;
          }
        });
      });
      setGrid(tempGrid);
    }
  }, [tileSet]);

  const resetGameHandler = async () => {
    setTileSet([]);
    setScore(0);
    await serverCall([]);
  };

  const serverCall = async (newTilesPos: gridElement[] = []) => {
    const data = await fetchServer(newTilesPos);
    if (!disableServer) {
      if (!data?.length && !firstCall) {
        setGameOver(true);
        return;
      }
      const dataWithIds = data.map((item) => {
        return {
          ...item,
          id: Math.random(),
        };
      });
      setFirstCall(false);
      setTileSet([...dataWithIds, ...newTilesPos]);
    }
    setMoving(false);
  };

  const findNextBlock = (tile: gridElement, direction: string, move: boolean, tempGrid: gridElement[]) => {
    let tempTilePos = { ...tile };
    if (move) tempTilePos = moveTile(tempTilePos, direction);
    const checkGridBlock = tempGrid.filter((block) => tempTilePos.x === block.x && tempTilePos.y === block.y && tempTilePos.z === block.z);
    if (checkGridBlock.length) {
      return checkGridBlock[0];
    } else {
      return false;
    }
  };

  const updateTile = (tile: gridElement, direction: string, removeTiles: number[], tempGrid: gridElement[]): gridElement | boolean => {
    const nexBlock: gridElement | boolean = findNextBlock(tile, direction, true, tempGrid);
    if (nexBlock === false) return tile;

    if (nexBlock && nexBlock.value) {
      if (nexBlock.value === tile.value) {
        const checkGridBlock = tempGrid.filter((block) => tile.x === block.x && tile.y === block.y && tile.z === block.z);
        setScore((prevScore) => prevScore + (tile.value + nexBlock.value));
        tile.x = nexBlock.x;
        tile.y = nexBlock.y;
        tile.z = nexBlock.z;
        tile.value = tile.value + nexBlock.value;
        if (nexBlock.id) removeTiles.push(nexBlock.id);

        nexBlock.value = tile.value;
        nexBlock.id = tile.id;
        checkGridBlock[0].value = 0;
        delete checkGridBlock[0].id;
        return updateTile(tile, direction, removeTiles, tempGrid);
      } else {
        return tile;
      }
    } else {
      const checkGridBlock = tempGrid.filter((block) => tile.x === block.x && tile.y === block.y && tile.z === block.z);
      tile.x = nexBlock.x;
      tile.y = nexBlock.y;
      tile.z = nexBlock.z;
      nexBlock.value = tile.value;
      nexBlock.id = tile.id;
      checkGridBlock[0].value = 0;
      delete checkGridBlock[0].id;
      return updateTile(tile, direction, removeTiles, tempGrid);
    }
  };

  const updateTilesPos = (direction: string) => {
    setMoving(true);

    const newTiles = [...tileSet];
    const tempGrid = [...grid];
    const removeTiles: number[] = [];

    const sortedTileSet = sortTileSet(newTiles, direction);
    const newTilesPos: any = sortedTileSet.map((tile) => {
      return updateTile(tile, direction, removeTiles, tempGrid);
    });

    removeTiles.forEach((tileId) => {
      newTilesPos.splice(newTilesPos.map((tile: gridElement) => tile.id).indexOf(tileId), 1);
    });

    setTileSet(newTilesPos);

    setTimeout(() => {
      serverCall(newTilesPos);
    }, 200);
  };

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat || moving || gameOver) return;
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

  if (!setTileSet.length) return <></>;

  return (
    <div className={styles.wrapper} id="game">
      {/* Dev Tools */}
      <div className={styles.devTools}>
        <button title="dev button" onClick={() => setShowCoords((prev) => !prev)}>
          ⚠️ {showCoords ? "Hide Coords" : "Show Coords"}
        </button>
        <button title="dev button" onClick={() => setDisableServer((prev) => !prev)}>
          ⚠️ {disableServer ? "Enable Server" : "Disable Server"}
        </button>
      </div>

      {/* Game Menu */}
      <GameMenu resetGameHandler={resetGameHandler} gameOver={gameOver} score={score} />

      {/* Game */}
      <div className={styles.gameWrapper}>
        <div className={styles.gameContainer}>
          {tileSet.map((tile) => (
            <Tile key={tile.id} style={getPositionFromCoordinates(tile)} value={tile.value} />
          ))}
          {grid.map((coords, index) => (
            <Block key={index} style={getPositionFromCoordinates(coords)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} showCoords={showCoords} />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <Instructions />
    </div>
  );
};
