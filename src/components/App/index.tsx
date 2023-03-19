import React, { useState, useRef, useEffect } from "react";
import Block from "../Block";
import Tile from "../Tile";
import styles from "./App.module.css";
import { getPositionFromCoords, cubeMovement } from "./utils";

const hardcodedGrid = [
  { x: 0, y: 1, z: -1, value: 0 },
  { x: -1, y: 1, z: 0, value: 0 },
  { x: 1, y: 0, z: -1, value: 0 },
  { x: 0, y: 0, z: 0, value: 0 },
  { x: -1, y: 0, z: 1, value: 0 },
  { x: -0, y: -1, z: 1, value: 0 },
  { x: 1, y: -1, z: 0, value: 0 },
];

type coordinates = {
  x: number;
  y: number;
  z: number;
  value: number;
};

export const App: React.FC = () => {
  const [grid, setGrid] = useState<coordinates[]>([]);
  const [tilesPos, setTilesPos] = useState<coordinates[]>([]);
  const [moving, setMoving] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [firstCall, setFirstCall] = useState(true);

  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [tilesPos, moving]);

  useEffect(() => {
    const tempGrid = [...hardcodedGrid];
    tempGrid.forEach((serverCoords) => (serverCoords.value = 0));

    setTilesPos([
      {
        x: 0,
        y: -1,
        z: 1,
        value: 4,
      },
      {
        x: 0,
        y: 1,
        z: -1,
        value: 4,
      },
      {
        x: 1,
        y: -1,
        z: 0,
        value: 2,
      },
      {
        x: -1,
        y: 0,
        z: 1,
        value: 4,
      },
      {
        x: -1,
        y: 0,
        z: 1,
        value: 2,
      },
    ]);
    tilesPos.forEach((serverCoords) => {
      tempGrid.forEach((gridCoords) => {
        if (gridCoords.x === serverCoords.x && gridCoords.y === serverCoords.y && gridCoords.z === serverCoords.z) {
          gridCoords.value = serverCoords.value;
        }
      });
    });
    setGrid(tempGrid);
    //serverCall();
  }, []);

  useEffect(() => {
    const tempGrid = [...grid];

    tempGrid.forEach((serverCoords) => (serverCoords.value = 0));

    tilesPos.forEach((serverCoords) => {
      tempGrid.forEach((gridCoords) => {
        if (gridCoords.x === serverCoords.x && gridCoords.y === serverCoords.y && gridCoords.z === serverCoords.z) {
          gridCoords.value = serverCoords.value;
        }
      });
    });

    setTimeout(() => {
      setMoving(false);
    }, 100);
  }, [tilesPos]);

  const serverCall = async () => {
    const serverResponse = await fetch("http://localhost:13337/2", {
      method: "POST",
      body: JSON.stringify(tilesPos),
    });
    const data: coordinates[] = await serverResponse.json();
    if (data.length && !firstCall) {
      setGameOver(true);
      return;
    }
    console.log("pepe");
    setFirstCall(true);
    console.log([...data, ...tilesPos]);
    setTilesPos([...data, ...tilesPos]);
  };

  const updateTilesPos = (direction: string) => {
    setMoving(true);

    const removeTiles: number[] = [];
    const newTilesPos = [...tilesPos].map((tile) => {
      const tempPos = { ...tile };
      for (let i = 0; i <= grid.length; i++) {
        cubeMovement(tempPos, direction);
        const checkGridBlock = grid.filter((block) => tempPos.x === block.x && tempPos.y === block.y && tempPos.z === block.z);
        if (checkGridBlock.length) {
          if (!checkGridBlock[0].value) {
            tile.x = checkGridBlock[0].x;
            tile.y = checkGridBlock[0].y;
            tile.z = checkGridBlock[0].z;
            continue;
          } else {
            if (tempPos.value === checkGridBlock[0].value) {
              [...tilesPos].forEach((tile, index) => {
                if (tile.x === checkGridBlock[0].x && tile.y === checkGridBlock[0].y && tile.z === checkGridBlock[0].z) {
                  removeTiles.push(index);
                }
              });
              tile.x = checkGridBlock[0].x;
              tile.y = checkGridBlock[0].y;
              tile.z = checkGridBlock[0].z;
              tile.value = tile.value + checkGridBlock[0].value;
            }
            break;
          }
        } else {
          break;
        }
      }
      return tile;
    });

    removeTiles.forEach((tileIndex) => {
      newTilesPos.splice(tileIndex, 1);
    });

    setTilesPos(newTilesPos);
    //serverCall();
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
    <div className={styles.gameWrapper}>
      <div className={styles.gameContainer}>
        {tilesPos.map((tile, index) => (
          <Tile key={index} style={getPositionFromCoords(tile)} value={tile.value} />
        ))}
        {grid.map((coords, index) => (
          <Block key={index} style={getPositionFromCoords(coords)} x={coords.x} y={coords.y} z={coords.z} value={coords.value} />
        ))}
      </div>
    </div>
  );
};
