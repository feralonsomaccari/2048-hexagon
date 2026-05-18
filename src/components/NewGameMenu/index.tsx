import { useState } from "react";
import styles from "./NewGameMenu.module.css";
import Button from "../Button";

type props = {
  resetGameHandler: (radius: number) => void;
};

const sizes = [
  { radius: 1, label: "Small", description: "7 cells" },
  { radius: 2, label: "Medium", description: "19 cells" },
  { radius: 3, label: "Large", description: "37 cells" },
  { radius: 4, label: "XL", description: "61 cells" },
];

const NewGameMenu = ({ resetGameHandler }: props) => {
  const [selected, setSelected] = useState(1);

  return (
    <div className={styles.wrapper} data-testid="new-game">
      <p className={styles.label}>Choose a board size</p>
      <div className={styles.grid}>
        {sizes.map(({ radius, label, description }) => (
          <button
            key={radius}
            className={`${styles.card} ${selected === radius ? styles.selected : ""}`}
            onClick={() => setSelected(radius)}
          >
            <span className={styles.cardLabel}>{label}</span>
            <span className={styles.cardDesc}>{description}</span>
          </button>
        ))}
      </div>
      <footer className={styles.footer}>
        <Button clickHandler={() => resetGameHandler(selected)} text="Start Game" />
      </footer>
    </div>
  );
};

export default NewGameMenu;
