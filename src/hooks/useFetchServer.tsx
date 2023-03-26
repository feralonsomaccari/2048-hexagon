import { useState, useEffect } from "react";
import { fetchServer } from "../services";
import { addIds } from "../utils";

const useFetchServer = (tileSet: gridElement[], radius: number) => {
  const [response, setResponse] = useState<gridElement[]>([]);
  const [error, setError] = useState<any>(null);

   const fetchTiles = async (newTileSet: gridElement[] = tileSet, newRadius: number = radius) => {
    try {
      const serverResponseData = await fetchServer<gridElement[]>(newTileSet, newRadius + 1);
      setResponse([...addIds(serverResponseData), ...newTileSet]);
    } catch (error) {
      // setError(error);
    }
  };

  useEffect(() => {
    fetchTiles();
  }, []);

  return [response, fetchTiles, error];
};

export default useFetchServer;
