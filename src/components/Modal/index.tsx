import styles from "./Modal.module.css";

type props = {
  setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode
};

const Modal = ({ setIsModalShown, children }: props) => {
  return (
    <div className={styles.modalWrapper}>
      <div className={styles.modalOverlay}></div>
      <section className={styles.modalContent}>
        <header className={styles.header}>
          <h3>Start New Game</h3>
          <button className={styles.closeButton} onClick={() => setIsModalShown(false)}>x</button>
        </header>
        {children}
      </section>
    </div>
  );
};

export default Modal;
