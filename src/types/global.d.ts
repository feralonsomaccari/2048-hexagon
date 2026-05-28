export {};

declare global {
  type gridElement = {
    x: number;
    y: number;
    z: number;
    value: number;
    id?: number;
    merged?: boolean
  };

  type savedGame = {
    tileSet: gridElement[],
    grid: gridElement[],
    score: number,
    comboBonus?: number,
    radius: number,
    historyTileSet?: gridElement[],
    historyScore?: number,
    historyComboBonus?: number,
    undoCount?: number,
    isUndoAvailable?: boolean,
    isMaxUndo?: boolean,
    removeCount?: number,
    isWin?: boolean,
    hasKeptPlaying?: boolean,
    bankedBonus?: number,
    movesCount?: number
  }
}
