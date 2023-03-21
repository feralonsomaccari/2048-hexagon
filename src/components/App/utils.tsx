type coordinates = {
  x: number;
  y: number;
  z: number;
  value: number;
  id?: number;
};

/**
 * Takes a grid block and returns the position in pixel values
 * @param {coordinates} block A block component 
 * @returns {object} Returns an object with the position of the element in pixels
 */
const getPositionFromCoordinates = (block: coordinates): any => {
  let edgeLength = 95;
  let edgeW = (edgeLength * 3) / 2;
  let edgeH = (edgeLength * Math.sqrt(3)) / 2;
  const width = 0;
  const height = 0;

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

/**
 * Takes a Tile and a Direction and return a new tile with the position updated in that direction whitin the Grid
 * @param {coordinates} tile A game tile
 * @param {string} direction
 * The direction in the x-axis, y-axis, z-axis (nortWest, nort, nortEast, southWest, south, southEast)
 * @returns {coordinates} Returns the tile with the position updated in the specified direction
 */
const moveTile = (tile: coordinates, direction: string) => {
  const updatedTile = {...tile}

  if(direction === 'northWest'){
    updatedTile.x = updatedTile.x -= 1
    updatedTile.y = updatedTile.y += 1 
  }
  if(direction === 'north'){
    updatedTile.y = updatedTile.y += 1
    updatedTile.z = updatedTile.z -= 1 
  }
  if(direction === 'northEast'){
    updatedTile.x = updatedTile.x += 1
    updatedTile.z = updatedTile.z -= 1 
  }
  if(direction === 'southWest'){
    updatedTile.x = updatedTile.x -= 1
    updatedTile.z = updatedTile.z += 1 
  }
  if(direction === 'south'){
    updatedTile.y = updatedTile.y -= 1
    updatedTile.z = updatedTile.z += 1 
  }
  if(direction === 'southEast'){
    updatedTile.x = updatedTile.x += 1
    updatedTile.y = updatedTile.y -= 1 
  }

  return updatedTile;
}

/**
 * Takes a Tile set and a Direction sort it into the specified direction
 * @param {coordinates[]} tileSet A set of Tiles
 * @param {string} direction 
 * The direction in the x-axis, y-axis, z-axis (nortWest, nort, nortEast, southWest, south, southEast)
 * @returns {coordinates[]} Returns the sorted set of Tiles
 */
const sortTileSet = (tileSet: coordinates[], direction: string) => {
  const sortedTileSet = [...tileSet]

  if(direction === 'northWest'){
    sortedTileSet.sort((a, b) => a.x - b.x && a.y - b.y)
  }
  if(direction === 'north'){
    sortedTileSet.sort((a, b) => b.y - a.y && a.z - b.z)
  }
  if(direction === 'northEast'){
    sortedTileSet.sort((a, b) => b.x - a.x && a.z - b.z)
  }
  if(direction === 'southWest'){
    sortedTileSet.sort((a, b) => a.x - b.x && b.z - a.z)
  }
  if(direction === 'south'){
    sortedTileSet.sort((a, b) => a.y - b.y && b.z - a.z)
  }
  if(direction === 'southEast'){
    sortedTileSet.sort((a, b) => b.x - a.x && a.y - b.y)
  }

  return sortedTileSet;
}

export { getPositionFromCoordinates, moveTile, sortTileSet };
