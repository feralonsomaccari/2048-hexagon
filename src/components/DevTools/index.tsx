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
      {/* <button
        title="dev button"
        onClick={() => setDisableServer((prev) => !prev)}
      >
        ⚠️ {disableServer ? "Enable Server" : "Disable Server"}
      </button> */}
    </aside>
  );
};

export default DevTools;
