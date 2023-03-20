type coordinates = {
  x: number;
  y: number;
  z: number;
};
const getPositionFromCoords = (grid: coordinates): any => {
  let edgeLength = 95;
  let edgeW = (edgeLength * 3) / 2;
  let edgeH = (edgeLength * Math.sqrt(3)) / 2;
  const width = 0;
  const height = 0;

  const [x, y, z] = [grid.x, grid.y, grid.z];
  const posX = x * edgeW + width;
  const posY = (-y + z) * edgeH + height;

  const newPosX = posX + Math.cos(0) * edgeLength;
  const newPosY = posY + Math.sin(0) * edgeLength;
  return {
    left: newPosX,
    top: newPosY,
  };
};

const cubeMovement = (tilePos: coordinates, direction: string) => {
  if(direction === 'northWest'){
    tilePos.x = tilePos.x -= 1
    tilePos.y = tilePos.y += 1 
  }
  if(direction === 'north'){
    tilePos.y = tilePos.y += 1
    tilePos.z = tilePos.z -= 1 
  }
  if(direction === 'northEast'){
    tilePos.x = tilePos.x += 1
    tilePos.z = tilePos.z -= 1 
  }
  if(direction === 'southWest'){
    tilePos.x = tilePos.x -= 1
    tilePos.z = tilePos.z += 1 
  }
  if(direction === 'south'){
    tilePos.y = tilePos.y -= 1
    tilePos.z = tilePos.z += 1 
  }
  if(direction === 'southEast'){
    tilePos.x = tilePos.x += 1
    tilePos.y = tilePos.y -= 1 
  }
}

const sortTileSet = (tiles: coordinates[], direction: string) => {
  if(direction === 'northWest'){
    tiles.sort((a, b) => a.x - b.x && a.y - b.y)
  }
  if(direction === 'north'){
    tiles.sort((a, b) => b.y - a.y && a.z - b.z)
  }
  if(direction === 'northEast'){
    tiles.sort((a, b) => b.x - a.x && a.z - b.z)
  }
  if(direction === 'southWest'){
    tiles.sort((a, b) => a.x - b.x && b.z - a.z)
  }
  if(direction === 'south'){
    tiles.sort((a, b) => a.y - b.y && b.z - a.z)
  }
  if(direction === 'southEast'){
    tiles.sort((a, b) => b.x - a.x && a.y - b.y)
  }
}

export { getPositionFromCoords, cubeMovement, sortTileSet };
