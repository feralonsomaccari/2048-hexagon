import { useRef } from "react";
import styles from "./NewGameMenu.module.css";
import Button from "../Button";

type props = {
  resetGameHandler: (radius: number) => void;
};

const NewGameMenu = ({ resetGameHandler }: props) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const chooseLevelHandler = () => {
    if (selectRef?.current) {
      const radius = parseInt(selectRef?.current?.value);
      resetGameHandler(radius);
    }
  };

  return (
    <>
      <section className={styles.section}>
        <span>Choose a level (radius)</span>
        <select className={styles.select} ref={selectRef}>
          <option value="1">2</option>
          <option value="2">3</option>
          <option value="3">4</option>
          <option value="4">5</option>
          <option value="5">6</option>
        </select>
      </section>

      <footer className={styles.footer}>
        <Button
          clickHandler={() => chooseLevelHandler()}
          text="Start new Game"
        />
      </footer>
    </>
  );
};

export default NewGameMenu;
