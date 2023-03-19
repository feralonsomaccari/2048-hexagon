import React, { useEffect } from "react";
import Block from "../Block";
import Tile from "../Tile";
import styles from "./App.module.css";
import { getPositionFromCoords } from "./utils";

const hardcodedGrid = [
  { x: 0, y: 1, z: -1 },
  { x: -1, y: 1, z: 0 },
  { x: 1, y: 0, z: -1 },
  { x: 0, y: 0, z: 0 },
  { x: -1, y: 0, z: 1 },
  { x: -0, y: -1, z: 1 },
  { x: 1, y: -1, z: 0 },
];

export const App: React.FC = () => {
  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  });

  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    switch (event.keyCode) {
      case 81:
        console.log("pepe");
        break;
      case 87:
        break;
      case 69:
        break;
      case 65:
        break;
      case 83:
        break;
      case 68:
        break;
    }
  };

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.gameContainer}>
        <Tile style={{ left: "95px", top: "0px" }} value={2} />
        {hardcodedGrid.map((coords, index) => (
          <Block key={index} style={getPositionFromCoords(coords)} x={coords.x} y={coords.y} z={coords.z} value={0} />
        ))}
      </div>
    </div>
  );
};
