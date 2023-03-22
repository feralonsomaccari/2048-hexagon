import styles from "./Block.module.css";

type props = {
  x: number;
  y: number;
  z: number;
  value?: number;
  style?: {};
  showCoords?: boolean;
  id?: number;
};

const Block = ({ x, y, z, value = 0, style = {}, showCoords, id = 0 }: props): JSX.Element => {
  return (
    <div data-testid="hexagon-el" style={style} className={styles.hexagon} data-x={x} data-y={y} data-z={z} data-value={value} data-id={id}>
      {showCoords && (
        <>
          x: {x} y: {y} z: {z} value: {value}
        </>
      )}
    </div>
  );
};

export default Block;
