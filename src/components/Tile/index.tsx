import React from 'react'
import styles from "./Tile.module.css";
import {getGridElementSizeFromRadius} from "../../utils"

type props = {
  value: number;
  left?: number;
  top?: number;
};

const Tile = ({ value, left, top}: props): JSX.Element => {
  const color = `color-${value}`;
  return (
    <div data-testid="tile" style={{left: left, top: top, ...getGridElementSizeFromRadius()}} className={`${styles.tile} ${styles[color]}`}>
      {value}
    </div>
  );
};

export default React.memo(Tile);
