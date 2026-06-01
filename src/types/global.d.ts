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
    radius: number,
    historyTileSet?: gridElement[],
    historyScore?: number,
    undoCount?: number,
    isUndoAvailable?: boolean,
    isMaxUndo?: boolean,
    removeCount?: number,
    swapCount?: number,
    isWin?: boolean,
    hasKeptPlaying?: boolean,
    bankedBonus?: number,
    movesCount?: number,
    bestTile?: number
  }
}
