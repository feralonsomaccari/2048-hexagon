import React, { useState, useRef, useEffect } from "react";
import Block from "../Block";
import Tile from "../Tile";
import styles from "./App.module.css";
import { getPositionFromCoords, cubeMovement, sortTileSet } from "./utils";
import GameMenu from "../GameMenu";

const hardcodedGrid = [
  { x: 0, y: 1, z: -1, value: 0 },
  { x: -1, y: 1, z: 0, value: 0 },
  { x: 1, y: 0, z: -1, value: 0 },
  { x: 0, y: 0, z: 0, value: 0 },
  { x: -1, y: 0, z: 1, value: 0 },
  { x: -0, y: -1, z: 1, value: 0 },
  { x: 1, y: -1, z: 0, value: 0 },
];

// const hardcodedServerResponse = [
//   { x: 0, y: -1, z: 1, value: 2, id: Math.random() },
//   { x: 0, y: 1, z: -1, value: 2, id: Math.random() },
//   { x: 0, y: 0, z: 0, value: 2, id: Math.random() },
// ];

type coordinates = {
  x: number;
  y: number;
  z: number;
  value: number;
  id?: number;
  added?: boolean;
};

export const App: React.FC = () => {
  const [grid, setGrid] = useState<coordinates[]>([]);
  const [tilesPos, setTilesPos] = useState<coordinates[]>([]);
  const [moving, setMoving] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [firstCall, setFirstCall] = useState(true);

  // DevStates
  const [showCoords, setShowCoords] = useState(false);
  const [disableServer, setDisableServer] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [tilesPos, moving, disableServer]);

  useEffect(() => {
    const tempGrid = [...hardcodedGrid];
    tempGrid.forEach((serverCoords) => (serverCoords.value = 0));
    setGrid(tempGrid);
    serverCall();
  }, []);

  useEffect(() => {
    if (grid.length) {
      const tempGrid = [...grid];

      tempGrid.forEach((serverCoords) => (serverCoords.value = 0));

      tilesPos.forEach((serverCoords) => {
        tempGrid.forEach((gridCoords) => {
          if (gridCoords.x === serverCoords.x && gridCoords.y === serverCoords.y && gridCoords.z === serverCoords.z) {
            gridCoords.value = serverCoords.value;
            gridCoords.id = serverCoords.id;
          }
        });
      });
      setGrid(tempGrid);
    }
  }, [tilesPos]);

  const serverCall = async (newTilesPos: coordinates[] = []) => {
    if (!disableServer) {
      const serverResponse = await fetch("http://localhost:13337/2", {
        method: "POST",
        body: JSON.stringify(newTilesPos),
      });
      const data: coordinates[] = await serverResponse.json();
      if (!data.length && !firstCall) {
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
      setTilesPos([...dataWithIds, ...newTilesPos]);
   }
  };

  const findNextBlock = (tile: coordinates, direction: string, move: boolean, tempGrid: coordinates[]) => {
    const tempTilePos = { ...tile };
    if (move) cubeMovement(tempTilePos, direction);
    const checkGridBlock = tempGrid.filter((block) => tempTilePos.x === block.x && tempTilePos.y === block.y && tempTilePos.z === block.z);
    if (checkGridBlock.length) {
      return checkGridBlock[0];
    } else {
      return false;
    }
  };

  const updateTile = (tile: coordinates, direction: string, removeTiles: number[], tempGrid: coordinates[]): coordinates | boolean => {
    const nexBlock: coordinates | boolean = findNextBlock(tile, direction, true, tempGrid);
    if (nexBlock === false) return tile;

    if (nexBlock && nexBlock.value) {
      if (nexBlock.value === tile.value) {
        const checkGridBlock = tempGrid.filter((block) => tile.x === block.x && tile.y === block.y && tile.z === block.z);
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

    const newTiles = [...tilesPos];
    const tempGrid = [...grid];
    const removeTiles: number[] = [];

    sortTileSet(newTiles, direction);
    const newTilesPos: any = newTiles.map((tile) => {
      return updateTile(tile, direction, removeTiles, tempGrid);
    });

    removeTiles.forEach((tileId) => {
      newTilesPos.splice(newTilesPos.map((tile: coordinates) => tile.id).indexOf(tileId), 1);
    });

    setTilesPos(newTilesPos);

    setTimeout(() => {
      setMoving(false);
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

  if (!setTilesPos.length) return <></>;
  
  return (
    <div className={styles.wrapper}>
      {/* Dev Tools */}
      <div className={styles.devTools}>
        <button onClick={() => setShowCoords((prev) => !prev)}>⚠️  {showCoords ? "Hide Coords" : "Show Coords"}</button>
        <button onClick={() => setDisableServer((prev) => !prev)}>⚠️ {disableServer ? "Enable Server" : "Disable Server"}</button>
      </div>

      {/* Game Menu */}
      <GameMenu gameOver={gameOver} />

      {/* Game */}
      <div className={styles.gameWrapper}>
        <div className={styles.gameContainer}>
          {tilesPos.map((tile, index) => (
            <Tile key={tile.id} style={getPositionFromCoords(tile)} value={tile.value} />
          ))}
          {grid.map((coords, index) => (
            <Block key={index} style={getPositionFromCoords(coords)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} showCoords={showCoords} />
          ))}
        </div>
      </div>
    </div>
  );
};
