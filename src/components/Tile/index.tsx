import React from 'react'
import styles from "./Tile.module.css";
import {getGridElementSizeFromRadius} from "../../utils"

type props = {
  value: number;
  left?: number;
  top?: number;
  radius?: number;
};

const Tile = ({ value, left, top, radius = 1 }: props): JSX.Element => {
  const width = 200 / (radius); // 200px divided by 70% of radius
  const height = 173 / (radius); // 173px divided by 70% of radius
  const color = `color-${value}`;
  return (
    <div data-testid="tile" style={{left: left, top: top, ...getGridElementSizeFromRadius(radius)}} className={`${styles.tile} ${styles[color]}`}>
      {value}
    </div>
  );
};

export default React.memo(Tile);
