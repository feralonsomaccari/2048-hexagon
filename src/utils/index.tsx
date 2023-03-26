/**
 * Takes a grid block and returns the position in pixel values
 * @param {gridElement} block A block component
 * @returns {object} Returns an object with the position of the element in pixels
 */
const getPositionFromCoordinates = (block: gridElement, radius: number): any => {
  let edgeLength = 66.5
  let edgeW = (edgeLength * 3) / 2;
  let edgeH = (edgeLength * Math.sqrt(3)) / 2;
  const width =  3/4 * 190;
  const height = 121.1*2;

  const [x, y, z] = [block.x, block.y, block.z];
  const posX = x * edgeW + width;
  const posY = (-y + z) * edgeH + height;

  const newPosX = posX + Math.cos(0) * edgeLength;
  const newPosY = posY + Math.sin(0) * edgeLength;
  return {
    left: newPosX,
    top: newPosY,
  };
};

const getGridElementSizeFromRadius = (radius: number) => {
  const width = 140  
  const height = 121.1
  return {
    width: width,
    height: height,
  };
};


/**
 * Takes a Tile and a Direction and return a new tile with the position updated in that direction whitin the Grid
 * @param {gridElement} tile A game tile
 * @param {string} direction
 * The direction in the x-axis, y-axis, z-axis (nortWest, nort, nortEast, southWest, south, southEast)
 * @returns {gridElement} Returns the tile with the position updated in the specified direction
 */
const moveTile = (tile: gridElement, direction: string) => {
  const updatedTile = { ...tile };

  if (direction === "northWest") {
    updatedTile.x = updatedTile.x -= 1;
    updatedTile.y = updatedTile.y += 1;
  }
  if (direction === "north") {
    updatedTile.y = updatedTile.y += 1;
    updatedTile.z = updatedTile.z -= 1;
  }
  if (direction === "northEast") {
    updatedTile.x = updatedTile.x += 1;
    updatedTile.z = updatedTile.z -= 1;
  }
  if (direction === "southWest") {
    updatedTile.x = updatedTile.x -= 1;
    updatedTile.z = updatedTile.z += 1;
  }
  if (direction === "south") {
    updatedTile.y = updatedTile.y -= 1;
    updatedTile.z = updatedTile.z += 1;
  }
  if (direction === "southEast") {
    updatedTile.x = updatedTile.x += 1;
    updatedTile.y = updatedTile.y -= 1;
  }

  return updatedTile;
};

/**
 * Takes a Tile set and a Direction sort it into the specified direction
 * @param {gridElement[]} tileSet A set of Tiles
 * @param {string} direction Orientation of the sorting
 * The direction in the x-axis, y-axis, z-axis (nortWest, nort, nortEast, southWest, south, southEast)
 * @returns {gridElement[]} Returns the sorted set of Tiles
 */
const sortTileSet = (tileSet: gridElement[], direction: string) => {
  const sortedTileSet = structuredClone(tileSet);

  if (direction === "northWest") {
    sortedTileSet.sort((a, b) => a.x - b.x || b.y - a.y);
  }
  if (direction === "north") {
    sortedTileSet.sort((a, b) => b.y - a.y || a.z - b.z);
  }
  if (direction === "northEast") {
    sortedTileSet.sort((a, b) => b.x - a.x || a.z - b.z);
  }
  if (direction === "southWest") {
    sortedTileSet.sort((a, b) => a.x - b.x || b.z - a.z);
  }
  if (direction === "south") {
    sortedTileSet.sort((a, b) => a.y - b.y || b.z - a.z);
  }
  if (direction === "southEast") {
    sortedTileSet.sort((a, b) => b.x - a.x || a.y - b.y);
  }

  return sortedTileSet;
};

/**
 * Takes a set of Tiles and sort it by id
 * @param {gridElement[]} tileSet A set of Tiles
 * @returns {gridElement[] | boolean } Returns the same tileSet sorted by id
 */
const sortTileSetById = (tileSet: gridElement[]) => {
  return tileSet.sort((a, b) => {
    if (a.id && b.id) {
      return a.id - b.id;
    }
    return a.x - b.x;
  });
};

/**
 * Takes a Tile element and returns the next Block and its properties in the grid in a particular direction.
 * If no block is found (means no possible to move forward) it will return false
 * @param {gridElement} tile A Tile element
 * @param {string} direction Direction of the movement
 * @param {string} grid Game Grid
 * @returns {gridElement[] | boolean } Returns the next block and its properties or false if non has been found
 */
const findNextBlock = (tile: gridElement, direction: string, grid: gridElement[]) => {
  const tempTilePos = moveTile({ ...tile }, direction);
  const checkGridBlock = grid.filter((block) => tempTilePos.x === block.x && tempTilePos.y === block.y && tempTilePos.z === block.z);

  if (checkGridBlock.length) return checkGridBlock[0];
  return false;
};

/**
 * Determine if there are still valid movements in the game in an particular direction
 * @param {gridElement[]} tiles A set of Tiles
 * @param {gridElement[]} grid Game Grid
 * @param {string[]} directions an Array of directions if non is given it will check all directions
 * @returns { boolean } Returns true if there are still valid movements and false if is not possible to move further
 */
const validMovementsAvailable = (tiles: gridElement[], grid: gridElement[], directions?: string[]) => {
  const directionsArr: string[] = directions ? directions : ["northWest", "north", "southWest", "south", "southEast"];

  const isValidMovementsAvailable = tiles.some((tile) => {
    return [...directionsArr].some((direction) => {
      const nextBlock = findNextBlock(tile, direction, grid);
      if (!nextBlock) return false;
      if (nextBlock.value === 0) return true;
      if (nextBlock.value === tile.value) return true;
      return false;
    });
  });

  return isValidMovementsAvailable;
};

/**
 * Given an Array of gridElements this function will add a random ID into every element
 * @param {gridElement[]} dataSet A Tile element
 * The direction in the x-axis, y-axis, z-axis (nortWest, nort, nortEast, southWest, south, southEast)
 * @returns {gridElement[] } Returns the set with ids added
 */
const addIds = (dataSet: gridElement[]) => {
  const dataWithIds = dataSet.map((item) => {
    return {
      ...item,
      id: Math.random(),
    };
  });
  return dataWithIds;
};

/**
 * Given set of cube coordinates it creates a hexagon block component
 * @param {number} x x axis
 * @param {number} y y axis
 * @param {number} z z axis
 * @returns {gridElement } Returns a hexagon block component
 */
const createHexBlock = (x: number, y: number, z: number): gridElement => ({
  x: x,
  y: y,
  z: z,
  value: 0,
});

/**
 * Given a radius it returns a hexagon grid
 * @param {number} radius radius
 * @returns {gridElement[] } Returns a hexagon grid
 */
const createHexGrid = (radius: number) => {
  const grid: gridElement[] = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      for (let k = -radius; k <= radius; k++) {
        if (i + j + k == 0) {
          grid.push(createHexBlock(i, j, k));
        }
      }
    }
  }

  return grid;
};

export { getPositionFromCoordinates, getGridElementSizeFromRadius, moveTile, sortTileSet, findNextBlock, addIds, validMovementsAvailable, sortTileSetById, createHexGrid };
