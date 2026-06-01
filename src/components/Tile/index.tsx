import React from 'react'
import styles from "./Tile.module.css";
import { getGridElementSizeFromRadius } from "../../utils/gameLogic";

type props = {
  value: number;
  left?: number;
  top?: number;
  merged?: boolean;
  targeting?: boolean;
  targetingAction?: "remove" | "swap";
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

const Tile = ({ value, left, top, merged, targeting = false, targetingAction = "remove", selected = false, removing = false, winning = false, onSelect }: props): JSX.Element => {
  const colorClass = COLORED_VALUES.has(value)
    ? styles[`color-${value}`]
    : styles["color-final"];
  const targetingLabel =
    targetingAction === "swap" ? `Swap tile ${value}` : `Remove tile ${value}`;
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
      className={`${styles.tile} ${targeting ? styles.targeting : ""} ${targeting && selected ? styles.selected : ""} ${winning ? styles.winning : ""}`}
      role={targeting ? "button" : "img"}
      aria-label={targeting ? targetingLabel : `Tile ${value}`}
      aria-pressed={targeting ? selected : undefined}
      tabIndex={targeting ? 0 : undefined}
      onClick={targeting ? onSelect : undefined}
      onKeyDown={
        targeting
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
