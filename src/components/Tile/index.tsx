import React from 'react'
import styles from "./Tile.module.css";
import { getGridElementSizeFromRadius } from "../../utils/gameLogic";

type props = {
  value: number;
  left?: number;
  top?: number;
  merged?: boolean;
  targeting?: boolean;
  targetable?: boolean;
  targetingAction?: "remove" | "swap" | "double";
  selected?: boolean;
  removing?: boolean;
  winning?: boolean;
  onSelect?: () => void;
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

const Tile = ({ value, left, top, merged, targeting = false, targetable = true, targetingAction = "remove", selected = false, removing = false, winning = false, onSelect }: props): JSX.Element => {
  const colorClass = COLORED_VALUES.has(value)
    ? styles[`color-${value}`]
    : styles["color-final"];
  const isTargetable = targeting && targetable;
  const targetingLabel =
    targetingAction === "swap"
      ? `Swap tile ${value}`
      : targetingAction === "double"
        ? `Double tile ${value}`
        : `Remove tile ${value}`;
  const fontSize = fontSizeForValue(value);

  if (removing) {
    return (
      <div
        data-testid="tile"
        style={{ left, top, ...getGridElementSizeFromRadius() }}
        className={`${styles.tile} ${styles.removing}`}
        role="img"
        aria-label={`Removing tile ${value}`}
      >
        <div className={`${styles.splitHalf} ${styles.splitTop} ${colorClass}`} style={{ fontSize }}>
          {value}
        </div>
        <div className={`${styles.splitHalf} ${styles.splitBottom} ${colorClass}`} style={{ fontSize }}>
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="tile"
      style={{ left, top, ...getGridElementSizeFromRadius() }}
      className={`${styles.tile} ${isTargetable ? styles.targeting : ""} ${isTargetable && selected ? styles.selected : ""} ${winning ? styles.winning : ""}`}
      role={isTargetable ? "button" : "img"}
      aria-label={isTargetable ? targetingLabel : `Tile ${value}`}
      aria-pressed={isTargetable ? selected : undefined}
      tabIndex={isTargetable ? 0 : undefined}
      onClick={isTargetable ? onSelect : undefined}
      onKeyDown={
        isTargetable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      <div
        className={`${styles.tileInner} ${colorClass} ${merged ? styles.merged : ""}`}
        style={{ fontSize }}
      >
        {value}
      </div>
    </div>
  );
};

export default React.memo(Tile);
