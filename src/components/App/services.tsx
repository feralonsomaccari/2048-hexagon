/**
 * Async function that fetches the server and returns a new set of Tiles
 * @param {gridElement[]} tilesPosition 
 * @returns {Promise<gridElement[]>} 
 */
const fetchServer = async (tilesPosition: gridElement[] = [] ) : Promise<gridElement[]>  => {
  const serverResponse = await fetch("http://localhost:13337/2", {
    method: "POST",
    body: JSON.stringify(tilesPosition),
  });
  const data: gridElement[] = await serverResponse.json();

  return data
};

export { fetchServer };
