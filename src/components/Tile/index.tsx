import React from 'react'
import styles from "./Tile.module.css";

type props = {
  value: number;
  left?: number;
  top?: number;
};

const Tile = ({ value, left, top }: props): JSX.Element => {
  const color = `color-${value}`;
  return (
    <div data-testid="tile" className={`${styles.tile} ${styles[color]}`} style={{left: left, top: top} }>
      {value}
    </div>
  );
};

export default React.memo(Tile);
