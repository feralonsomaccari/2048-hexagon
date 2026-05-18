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
      className={styles.tile}
      role="img"
      aria-label={`Tile ${value}`}
    >
      <div className={`${styles.tileInner} ${styles[color]} ${merged ? styles.merged : ""}`}>
        {value}
      </div>
    </div>
  );
};

export default React.memo(Tile);
