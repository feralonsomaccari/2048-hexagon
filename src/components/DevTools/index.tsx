import styles from "./DevTools.module.css";

type props = {
  showCoords: boolean;
  setShowCoords: React.Dispatch<React.SetStateAction<boolean>>;
  disableServer: boolean;
  setDisableServer: React.Dispatch<React.SetStateAction<boolean>>;
};

const DevTools = ({
  showCoords,
  setShowCoords,
  disableServer,
  setDisableServer,
}: props) => {
  return (
    <div className={styles.devTools}>
      <button title="dev button" onClick={() => setShowCoords((prev) => !prev)}>
        ⚠️ {showCoords ? "Hide Coords" : "Show Coords"}
      </button>
      <button
        title="dev button"
        onClick={() => setDisableServer((prev) => !prev)}
      >
        ⚠️ {disableServer ? "Enable Server" : "Disable Server"}
      </button>
    </div>
  );
};

export default DevTools;
