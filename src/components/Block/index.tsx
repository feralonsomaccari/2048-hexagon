import React from 'react'
import styles from "./Block.module.css";

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
  left?: number;
  top?: number;
  showCoords?: boolean;
  id?: string;
};

const Block = ({ x, y, z, value = 0, left, top, showCoords, id }: props): JSX.Element => {
  return (
    <div data-testid="block" style={{left: left, top: top}} className={styles.hexagon} data-x={x} data-y={y} data-z={z} data-value={value} data-id={id}>
      {showCoords && (
        <>
          x: {x} y: {y} z: {z} value: {value}
        </>
      )}
    </div>
  );
};

export default React.memo(Block);
