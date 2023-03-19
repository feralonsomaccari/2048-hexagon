import styles from "./Block.module.css";

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
  col?: number;
  row?: number;
  style?: object;
};

const Block = ({ x, y, z, value = 0, col = 0, row = 0, style = {} }: props): JSX.Element => {
  return <div style={style} className={styles.hexagon} data-x={x} data-y={y} data-z={z} data-value={value} />;
};

export default Block;
