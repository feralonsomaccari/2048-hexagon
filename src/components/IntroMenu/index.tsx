import { useRef, useEffect } from "react";
import styles from "./IntroMenu.module.css";
import Button from "../Button";

type props = {
  setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
  resetGameHandler: (radius: number) => void;
};

const IntroMenu = ({ setIsModalShown, resetGameHandler }: props) => {
  useEffect(() => {
    
  }, []);

  const selectRef = useRef<HTMLSelectElement>(null);

  const chooseLevelHandler = () => {
    if (selectRef?.current) {
      const radius = parseInt(selectRef?.current?.value);
      setIsModalShown(false);
      resetGameHandler(radius);
    }
  };

  return (
    <div className={styles.introMenuWrapper}>
      <div className={styles.overlay}></div>
      <section className={styles.introMenuModal}>
        <header className={styles.section}>
          <h3>Start New Game</h3>
          <button
            className={styles.closeButton}
            onClick={() => setIsModalShown(false)}
          >
            x
          </button>
        </header>

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
          <Button clickHandler={() => setIsModalShown(false)} text="Cancel" />
        </footer>
      </section>
    </div>
  );
};

export default IntroMenu;
