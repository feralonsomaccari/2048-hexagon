import { useEffect } from "react";
import styles from "./Tile.module.css";

type props = {
  value: number;
  style: {};
};

const Tile = ({ value, style }: props): JSX.Element => {
  const keyPressHandler = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    switch (event.keyCode) {
      case 81:
        break;
      case 87:
        break;
      case 69:
        break;
      case 65:
        break;
      case 83:
        break;
      case 68:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);

    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  });

  return (
    <div className={styles.tile} style={style}>
      {value}
    </div>
  );
};

export default Tile;
