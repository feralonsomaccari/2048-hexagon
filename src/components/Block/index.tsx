import React from "react";
import styles from "./Block.module.css";
import {getGridElementSizeFromRadius} from "../../utils"

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
  left?: number;
  top?: number;
  showCoords?: boolean;
};

const Block = ({ x, y, z, value = 0, left, top, showCoords }: props): JSX.Element => {

  return (
    <div data-testid="block" style={{ left: left, top: top, ...getGridElementSizeFromRadius() }} className={styles.hexagon} data-x={x} data-y={y} data-z={z} data-value={value}>
      {showCoords && (
        <span className={styles.coordinates}>
          x: {x} y: {y} z: {z} value: {value}
        </span>
      )}
    </div>
  );
};

export default React.memo(Block);
