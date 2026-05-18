import styles from "./DevTools.module.css";

type props = {
  showCoords: boolean;
  setShowCoords: React.Dispatch<React.SetStateAction<boolean>>;
};

const DevTools = ({
  showCoords,
  setShowCoords,
}: props) => {
  return (
    <aside className={styles.devTools}>
      <button title="dev button" onClick={() => setShowCoords((prev) => !prev)}>
        ⚠️ {showCoords ? "Hide Coords" : "Show Coords"}
      </button>
    </aside>
  );
};

export default DevTools;
