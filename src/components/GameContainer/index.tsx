import styles from "./GameContainer.module.css";
import Block from "../Block";
import Tile from "../Tile";
import { getPositionFromCoordinates } from "../App/utils";

type props = {
  tileSet: gridElement[];
  grid: gridElement[];
  showCoords?: boolean;
};

const GameContainer = ({ tileSet, grid, showCoords }: props) => {
  return (
    <div className={styles.gameWrapper} id="game">
      <div className={styles.gameContainer}>
        {tileSet.map((tile) => (
          <Tile
            key={tile.id}
            style={getPositionFromCoordinates(tile)}
            value={tile.value}
          />
        ))}
        {grid.map((coords, index) => (
          <Block
            key={index}
            style={getPositionFromCoordinates(coords)}
            x={coords.x}
            y={coords.y}
            z={coords.z}
            value={coords.value}
            showCoords={showCoords}
          />
        ))}
      </div>
    </div>
  );
};

export default GameContainer;
