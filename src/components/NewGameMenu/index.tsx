import { useRef, useState } from "react";
import styles from "./NewGameMenu.module.css";
import Button from "../Button";

type props = {
  resetGameHandler: (radius: number) => void;
  currentRadius?: number;
};

const sizes = [
  { radius: 1, label: "Small", description: "7 cells" },
  { radius: 2, label: "Normal", description: "19 cells" },
  // { radius: 3, label: "Large", description: "37 cells" },
  // { radius: 4, label: "XL", description: "61 cells" },
];

const NewGameMenu = ({ resetGameHandler, currentRadius = 2 }: props) => {
  const [selected, setSelected] = useState(currentRadius);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusAt = (index: number) => {
    const wrapped = (index + sizes.length) % sizes.length;
    setSelected(sizes[wrapped].radius);
    cardRefs.current[wrapped]?.focus();
  };

  const onCardKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAt(currentIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAt(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(sizes.length - 1);
        break;
    }
  };

  return (
    <div className={styles.wrapper} data-testid="new-game">
      <p className={styles.label} id="board-size-label">Choose a board size</p>
      <div
        className={styles.grid}
        role="radiogroup"
        aria-labelledby="board-size-label"
      >
        {sizes.map(({ radius, label, description }, index) => {
          const isSelected = selected === radius;
          return (
            <button
              key={radius}
              ref={(el) => { cardRefs.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`${styles.card} ${isSelected ? styles.selected : ""}`}
              onClick={() => setSelected(radius)}
              onKeyDown={(event) => onCardKeyDown(event, index)}
            >
              <span className={styles.cardLabel}>{label}</span>
              <span className={styles.cardDesc}>{description}</span>
            </button>
          );
        })}
      </div>
      <footer className={styles.footer}>
        <Button clickHandler={() => resetGameHandler(selected)} text="Start Game" />
      </footer>
    </div>
  );
};

export default NewGameMenu;
