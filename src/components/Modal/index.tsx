import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

type props = {
  setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
};

const Modal = ({ setIsModalShown, children }: props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsModalShown(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [setIsModalShown]);

  return (
    <>
      <div data-testid="modal-overlay" className={styles.modalOverlay} onClick={() => setIsModalShown(false)} />
      <div
        ref={dialogRef}
        className={styles.modalWrapper}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <section className={styles.modalContent}>
          <header className={styles.header}>
            <h3 id="modal-title">New Game</h3>
            <button
              data-testid="close-btn"
              className={styles.closeButton}
              onClick={() => setIsModalShown(false)}
              aria-label="Close dialog"
              type="button"
            >
              <span aria-hidden="true">✕</span>
            </button>
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
