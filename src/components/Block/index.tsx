import React from "react";
import styles from "./Block.module.css";
import { getGridElementSizeFromRadius } from "../../utils/gameLogic";

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
  left?: number;
  top?: number;
};

const Block = ({ x, y, z, value = 0, left, top }: props): JSX.Element => {
  const blocked = value === -1;
  return (
    <div data-testid="block" style={{ left, top, ...getGridElementSizeFromRadius() }} className={`${styles.hexagon} ${blocked ? styles.blocked : ""}`} data-x={x} data-y={y} data-z={z} data-value={value} data-blocked={blocked || undefined} aria-hidden="true" />
  );
};

export default React.memo(Block);
