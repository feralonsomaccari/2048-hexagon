import styles from "./Modal.module.css";

type props = {
  setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
};

const Modal = ({ setIsModalShown, children }: props) => {
  return (
    <>
      <div className={styles.modalOverlay} onClick={() => setIsModalShown(false)} />
      <div className={styles.modalWrapper}>
        <section className={styles.modalContent}>
          <header className={styles.header}>
            <h3>New Game</h3>
            <button data-testid="close-btn" className={styles.closeButton} onClick={() => setIsModalShown(false)}>✕</button>
          </header>
          <div className={styles.children}>
            {children}
          </div>
        </section>
      </div>
    </>
  );
};

export default Modal;
