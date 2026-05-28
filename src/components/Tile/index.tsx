import React from 'react'
import styles from "./Tile.module.css";
import { getGridElementSizeFromRadius } from "../../utils/gameLogic";

type props = {
  value: number;
  left?: number;
  top?: number;
  merged?: boolean;
};

const COLORED_VALUES = new Set([
  2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
  65536,
]);

const fontSizeForValue = (value: number): number => {
  const digits = String(value).length;
  if (digits <= 4) return 42;
  if (digits === 5) return 34;
  if (digits === 6) return 28;
  return 24;
};

const Tile = ({ value, left, top, merged }: props): JSX.Element => {
  const colorClass = COLORED_VALUES.has(value)
    ? styles[`color-${value}`]
    : styles["color-final"];
  return (
    <div
      data-testid="tile"
      style={{ left, top, ...getGridElementSizeFromRadius() }}
      className={styles.tile}
      role="img"
      aria-label={`Tile ${value}`}
    >
      <div
        className={`${styles.tileInner} ${colorClass} ${merged ? styles.merged : ""}`}
        style={{ fontSize: fontSizeForValue(value) }}
      >
        {value}
      </div>
    </div>
  );
};

export default React.memo(Tile);
