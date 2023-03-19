import styles from "./Block.module.css";

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
  style?: {};
};

const Block = ({ x, y, z, value = 0, style = {} }: props): JSX.Element => {
  return <div data-testid="hexagon-el" style={style} className={styles.hexagon} data-x={x} data-y={y} data-z={z} data-value={value}>
    {x} {' '}
    {y} {' '}
    {z} {' '}
  </div>;
};

export default Block;
