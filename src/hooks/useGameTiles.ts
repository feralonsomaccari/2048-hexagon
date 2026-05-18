import { useState, useEffect } from "react";
import { getRNGPoints } from "../utils/generateTiles";
import { addIds } from "../utils/gameLogic";

const useGameTiles = (tileSet: gridElement[], radius: number) => {
  const [response, setResponse] = useState<gridElement[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchTiles = async (newTileSet: gridElement[] = tileSet, newRadius: number = radius) => {
    try {
      const result = getRNGPoints(newRadius + 1, newTileSet);
      setResponse([...addIds(result), ...newTileSet]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTiles(); }, []);

  return [response, fetchTiles, error] as const;
};

export default useGameTiles;
