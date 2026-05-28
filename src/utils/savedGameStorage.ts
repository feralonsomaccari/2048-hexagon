import { isValidSavedGame } from "./gameLogic";

const STORAGE_KEY = "savedGame";
const RADIUS_KEY = "lastRadius";

export const loadLastRadius = (): number | null => {
  try {
    const raw = localStorage.getItem(RADIUS_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveLastRadius = (radius: number): void => {
  try {
    localStorage.setItem(RADIUS_KEY, String(radius));
  } catch {

  }
};

export const loadSavedGame = (): savedGame | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as savedGame;
    return isValidSavedGame(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveGame = (state: savedGame): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {

  }
};

export const clearSavedGame = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {

  }
};
