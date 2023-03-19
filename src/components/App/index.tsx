import React from "react";
import Block from "../Block";
import Tile from "../Tile";
import styles from "./App.module.css";

export const App: React.FC = () => {
  const hardcodedField = [
    { x: 0, y: 1, z: -1 },
    { x: -1, y: 1, z: 0 },
    { x: 1, y: 0, z: -1 },
    { x: 0, y: 0, z: 0 },
    { x: -1, y: 0, z: 1 },
    { x: -0, y: -1, z: 1 },
    { x: 1, y: -1, z: 0 },
  ];

  type coordinates = {
    x: number;
    y: number;
    z: number;
  };
  const getPositionFromCoords = (grid : coordinates): any => {
    let edgeLength = 95;
    let edgeW = (edgeLength * 3) / 2;
    let edgeH = (edgeLength * Math.sqrt(3)) / 2;
    const width = 0;
    const height = 0;

    const [x, y, z] = [grid.x, grid.y, grid.z];
    const posX = x * edgeW + width;
    const posY = (-y + z) * edgeH + height;

    const newPosX = posX + Math.cos(0) * edgeLength;
    const newPosY = posY + Math.sin(0) * edgeLength;
    return {
      left: newPosX,
      top: newPosY
    }
  };

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.gameContainer}>
        <Tile style={{left: '95px', top: '0px'}} value={2}></Tile>
        {hardcodedField.map((coords, index) => (
          <Block key={index} style={getPositionFromCoords(coords)} x={coords.x} y={coords.y} z={coords.z} value={0} />
        ))}
      </div>
    </div>
  );
};
