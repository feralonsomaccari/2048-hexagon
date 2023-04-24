import styles from "./Modal.module.css";

type props = {
  setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode
};

const Modal = ({ setIsModalShown, children }: props) => {
  return (
    <div className={styles.modalWrapper}>
      <div className={styles.modalOverlay} />
      <section className={styles.modalContent}>
        <header className={styles.header}>
          <h3>Start New Game</h3>
          <button data-testid="close-btn" className={styles.closeButton} onClick={() => setIsModalShown(false)}>x</button>
        </header>
        <section className={styles.children}>
          {children}
        </section>
      </section>
    </div>
  );
};

export default Modal;
