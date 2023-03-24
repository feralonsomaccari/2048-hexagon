/**
 * Async function that fetches the server and returns a new set of Tiles
 * @param {gridElement[]} tileSet a set of tiles 
 * @param {number} radius radius of the grid 
 * @returns {Promise<gridElement[]>} 
 */
const fetchServer = async (tileSet: gridElement[] = [], radius: number ) : Promise<gridElement[]>  => {
  const serverResponse = await fetch(`http://localhost:13337/${radius}`, {
    method: "POST",
    body: JSON.stringify(tileSet),
  });
  const data: gridElement[] = await serverResponse.json();

  return data
};

export { fetchServer };
