/**
 * Async function that fetches the server and returns a new set of Tiles
 * @param {gridElement[]} tileSet a set of tiles 
 * @param {number} radius radius of the grid 
 * @returns {Promise<gridElement[]>} 
 */
async function fetchServer<TResponse>(tileSet: gridElement[] = [], radius: number ): Promise<TResponse> {
  const serverResponse = await fetch(`http://localhost:13337/${radius}`, {
    method: "POST",
    body: JSON.stringify(tileSet),
  });
  const data: gridElement[] = await serverResponse.json();

  return data as TResponse
};

export { fetchServer };
