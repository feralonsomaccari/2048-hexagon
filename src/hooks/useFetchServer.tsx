import { useState, useEffect } from "react";
import { getRNGPoints } from "../services/generateTiles";
import { addIds } from "../utils";

const useFetchServer = (tileSet: gridElement[], radius: number) => {
  const [response, setResponse] = useState<gridElement[]>([]);
  const [error, setError] = useState<any>(null);

   const fetchTiles = async (newTileSet: gridElement[] = tileSet, newRadius: number = radius) => {
    try {
      const response = getRNGPoints(newRadius + 1, newTileSet);
      setResponse([...addIds(response), ...newTileSet]);
    } catch (error) {
      setError(error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTiles(); }, []);

  return [response, fetchTiles, error];
};

export default useFetchServer;
