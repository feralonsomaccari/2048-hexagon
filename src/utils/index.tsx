const getPositionFromCoordinates = (block: gridElement, radius: number = 2): { left: number; top: number } => {
  const edgeLength = 66.5;
  const edgeW = (edgeLength * 3) / 2;
  const edgeH = (edgeLength * Math.sqrt(3)) / 2;

  // Zero-base both axes so content starts at (0,0) for any radius
  const leftOffset = radius * edgeW;
  const topOffset = 2 * radius * edgeH;

  const posX = block.x * edgeW + leftOffset;
  const posY = (-block.y + block.z) * edgeH + topOffset;

  return { left: posX, top: posY };
};

const getGridElementSizeFromRadius = () => ({
  width: 140,
  height: 121.1,
});

const moveTile = (tile: gridElement, direction: string) => {
  const updatedTile = { ...tile };

  if (direction === "northWest") {
    updatedTile.x -= 1;
    updatedTile.y += 1;
  } else if (direction === "north") {
    updatedTile.y += 1;
    updatedTile.z -= 1;
  } else if (direction === "northEast") {
    updatedTile.x += 1;
    updatedTile.z -= 1;
  } else if (direction === "southWest") {
    updatedTile.x -= 1;
    updatedTile.z += 1;
  } else if (direction === "south") {
    updatedTile.y -= 1;
    updatedTile.z += 1;
  } else if (direction === "southEast") {
    updatedTile.x += 1;
    updatedTile.y -= 1;
  }

  return updatedTile;
};

const sortTileSet = (tileSet: gridElement[], direction: string) => {
  const sortedTileSet = structuredClone(tileSet);

  if (direction === "northWest") {
    sortedTileSet.sort((a, b) => a.x - b.x || b.y - a.y);
  } else if (direction === "north") {
    sortedTileSet.sort((a, b) => b.y - a.y || a.z - b.z);
  } else if (direction === "northEast") {
    sortedTileSet.sort((a, b) => b.x - a.x || a.z - b.z);
  } else if (direction === "southWest") {
    sortedTileSet.sort((a, b) => a.x - b.x || b.z - a.z);
  } else if (direction === "south") {
    sortedTileSet.sort((a, b) => a.y - b.y || b.z - a.z);
  } else if (direction === "southEast") {
    sortedTileSet.sort((a, b) => b.x - a.x || a.y - b.y);
  }

  return sortedTileSet;
};

const sortTileSetById = (tileSet: gridElement[]) => {
  return tileSet.sort((a, b) => {
    if (a.id && b.id) return a.id - b.id;
    return a.x - b.x;
  });
};

const findNextBlock = (tile: gridElement, direction: string, grid: gridElement[]) => {
  const tempTilePos = moveTile({ ...tile }, direction);
  const match = grid.find(
    (block) =>
      tempTilePos.x === block.x &&
      tempTilePos.y === block.y &&
      tempTilePos.z === block.z
  );
  return match ?? false;
};

const validMovementsAvailable = (
  tiles: gridElement[],
  grid: gridElement[],
  directions?: string[]
) => {
  const directionsArr = directions ?? ["northWest", "north", "northEast", "southWest", "south", "southEast"];

  return tiles.some((tile) =>
    directionsArr.some((direction) => {
      const nextBlock = findNextBlock(tile, direction, grid);
      if (!nextBlock) return false;
      return nextBlock.value === 0 || nextBlock.value === tile.value;
    })
  );
};

const addIds = (dataSet: gridElement[]): gridElement[] =>
  dataSet.map((item) => ({ ...item, id: Math.random() }));

const createHexBlock = (x: number, y: number, z: number): gridElement => ({ x, y, z, value: 0 });

const createHexGrid = (radius: number): gridElement[] => {
  const grid: gridElement[] = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      for (let k = -radius; k <= radius; k++) {
        if (i + j + k === 0) grid.push(createHexBlock(i, j, k));
      }
    }
  }

  return grid;
};

const isValidSavedGame = (savedGame: savedGame) =>
  savedGame &&
  savedGame?.tileSet?.length &&
  savedGame?.grid?.length &&
  "score" in savedGame &&
  "radius" in savedGame;

export {
  getPositionFromCoordinates,
  getGridElementSizeFromRadius,
  moveTile,
  sortTileSet,
  findNextBlock,
  addIds,
  validMovementsAvailable,
  sortTileSetById,
  createHexGrid,
  isValidSavedGame,
};
