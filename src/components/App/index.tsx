import React, { useState, useRef, useEffect } from "react";
import Block from "../Block";
import Tile from "../Tile";
import styles from "./App.module.css";
import { getPositionFromCoords } from "./utils";

const hardcodedGrid = [
  { x: 0, y: 1, z: -1, value: 0 },
  { x: -1, y: 1, z: 0, value: 0 },
  { x: 1, y: 0, z: -1, value: 0 },
  { x: 0, y: 0, z: 0, value: 0 },
  { x: -1, y: 0, z: 1, value: 0 },
  { x: -0, y: -1, z: 1, value: 0 },
  { x: 1, y: -1, z: 0, value: 0 },
];

const hardcodedServerResponse = [
  { x: 0, y: 1, z: -1, value: 2, key: 'asd' },
  // { x: 1, y: 0, z: -1, value: 2 },
  // { x: 1, y: -1, z: 0, value: 2 },
];

type coordinates = {
  x: number;
  y: number;
  z: number;
  value: number;
};

export const App: React.FC = () => {
  const [grid, setGrid] = useState<coordinates[]>([])
  const [tilesPos, setTilesPos] = useState<coordinates[]>([])
  
  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);
    
    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [tilesPos]);
  
  useEffect(() => {
    setTilesPos(hardcodedServerResponse)
    const tempGrid = [...hardcodedGrid];
    hardcodedServerResponse.forEach(serverCoords => {
      tempGrid.forEach(gridCoords => {
        if(gridCoords.x === serverCoords.x 
          && gridCoords.y === serverCoords.y 
          && gridCoords.z === serverCoords.z ){
            gridCoords.value = serverCoords.value
          }
      })
    })
    setGrid(tempGrid)

  }, [])

  if(!setTilesPos.length)  return <></>;


  const updateTilesPos = (direction : string) => {
      
    const cube = (tilePos : coordinates) => {
      if(direction === 'northWest'){
        tilePos.x = tilePos.x -= 1
        tilePos.y = tilePos.y += 1 
      }
      if(direction === 'north'){
        tilePos.y = tilePos.y += 1
        tilePos.z = tilePos.z -= 1 
      }
      if(direction === 'northEast'){
        tilePos.x = tilePos.x += 1
        tilePos.z = tilePos.z -= 1 
      }
      if(direction === 'southWest'){
        tilePos.x = tilePos.x -= 1
        tilePos.z = tilePos.z += 1 
      }
      if(direction === 'south'){
        tilePos.y = tilePos.y -= 1
        tilePos.z = tilePos.z += 1 
      }
      if(direction === 'southEast'){
        tilePos.x = tilePos.x += 1
        tilePos.y = tilePos.y -= 1 
      }
    }
    const newTilesPos = [...tilesPos]
    const updatedNewTilesPos = newTilesPos.map(tilePos => {
        cube(tilePos)
        return tilePos;
    })
    setTilesPos(updatedNewTilesPos)
  }

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    switch (event.key) {
      case "q":
      case "Q":
        updateTilesPos('northWest')
        break;
      case "w":
      case "W":
        updateTilesPos('north')
        break;
      case "e":
      case "E":
        updateTilesPos('northEast')
        break;
      case "a":
      case "A":
        updateTilesPos('southWest')
        break;
      case "s":
      case "S":
        updateTilesPos('south')
        break;
      case "d":
      case "D":
        updateTilesPos('southEast')
        break;
      case "f":
      case "F":
        break;
    }
  };

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
