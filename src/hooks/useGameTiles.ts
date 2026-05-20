import { useState, useEffect } from "react";
import { getRNGPoints } from "../utils/generateTiles";
import { addIds, hasBlockedCenter } from "../utils/gameLogic";

const useGameTiles = (tileSet: gridElement[], radius: number) => {
  const [response, setResponse] = useState<gridElement[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchTiles = async (newTileSet: gridElement[] = tileSet, newRadius: number = radius) => {
    try {
      const blocked = hasBlockedCenter(newRadius) ? [{ x: 0, y: 0, z: 0 }] : [];
      const result = getRNGPoints(newRadius + 1, newTileSet, blocked);
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
