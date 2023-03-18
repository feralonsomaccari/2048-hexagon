import styles from "./Block.module.css";

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
};

const Block = ({ x, y, z, value = 0 }: props): JSX.Element => {
  return <div className={styles.hexagon} data-x={x} data-y={y} data-z={z} data-value={value} />;
};

export default Block;
