import styles from "./Tile.module.css";

type props = {
  value: number;
  style: {};
};

const Tile = ({ value, style }: props): JSX.Element => {
  return (
    <div className={styles.tile} style={style}>
      {value}
    </div>
  );
};

export default Tile;
