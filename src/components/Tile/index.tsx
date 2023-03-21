import styles from "./Tile.module.css";

type props = {
  value: number;
  style?: {};
};

const Tile = ({ value, style }: props): JSX.Element => {
  const color = `color-${value}`;
  return (
    <div data-testid="tile" className={`${styles.tile} ${styles[color]}`} style={style}>
      {value}
    </div>
  );
};

export default Tile;
