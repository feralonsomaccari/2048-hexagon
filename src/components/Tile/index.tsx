import React from 'react'
import styles from "./Tile.module.css";
import { getGridElementSizeFromRadius } from "../../utils/gameLogic";

type props = {
  value: number;
  left?: number;
  top?: number;
  merged?: boolean;
};

const Tile = ({ value, left, top, merged }: props): JSX.Element => {
  const color = `color-${value}`;
  return (
    <div
      data-testid="tile"
      style={{ left, top, ...getGridElementSizeFromRadius() }}
      className={`${styles.tile} ${styles[color]} ${merged ? styles.merged : ""}`}
      role="img"
      aria-label={`Tile ${value}`}
    >
      {value}
    </div>
  );
};

export default React.memo(Tile);
