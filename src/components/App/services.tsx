type coordinates = {
  x: number;
  y: number;
  z: number;
  value: number;
  id?: number;
};

/**
 * Async function that fetches the server and returns a new set of Tiles
 * @param {coordinates[]} tilesPosition 
 * @returns {Promise<coordinates[]>} 
 */
const fetchServer = async (tilesPosition: coordinates[] = [] ) : Promise<coordinates[]>  => {
  const serverResponse = await fetch("http://localhost:13337/2", {
    method: "POST",
    body: JSON.stringify(tilesPosition),
  });
  const data: coordinates[] = await serverResponse.json();

  return data
};

export { fetchServer };
