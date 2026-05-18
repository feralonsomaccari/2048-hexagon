import {
  moveTile,
  findNextBlock,
  validMovementsAvailable,
  sortTileSet,
  createHexGrid,
  addIds,
} from "./gameLogic";

const tile = (x: number, y: number, z: number, value = 2): gridElement => ({ x, y, z, value });

describe("moveTile", () => {
  it("moves northWest: x-1, y+1", () => {
    const result = moveTile(tile(0, 0, 0), "northWest");
    expect(result).toMatchObject({ x: -1, y: 1, z: 0 });
  });

  it("moves north: y+1, z-1", () => {
    const result = moveTile(tile(0, 0, 0), "north");
    expect(result).toMatchObject({ x: 0, y: 1, z: -1 });
  });

  it("moves northEast: x+1, z-1", () => {
    const result = moveTile(tile(0, 0, 0), "northEast");
    expect(result).toMatchObject({ x: 1, y: 0, z: -1 });
  });

  it("moves southWest: x-1, z+1", () => {
    const result = moveTile(tile(0, 0, 0), "southWest");
    expect(result).toMatchObject({ x: -1, y: 0, z: 1 });
  });

  it("moves south: y-1, z+1", () => {
    const result = moveTile(tile(0, 0, 0), "south");
    expect(result).toMatchObject({ x: 0, y: -1, z: 1 });
  });

  it("moves southEast: x+1, y-1", () => {
    const result = moveTile(tile(0, 0, 0), "southEast");
    expect(result).toMatchObject({ x: 1, y: -1, z: 0 });
  });

  it("does not mutate the original tile", () => {
    const original = tile(0, 0, 0);
    moveTile(original, "north");
    expect(original).toMatchObject({ x: 0, y: 0, z: 0 });
  });
});

describe("createHexGrid", () => {
  it("creates 7 blocks for radius 1", () => {
    expect(createHexGrid(1)).toHaveLength(7);
  });

  it("creates 19 blocks for radius 2", () => {
    expect(createHexGrid(2)).toHaveLength(19);
  });

  it("creates 37 blocks for radius 3", () => {
    expect(createHexGrid(3)).toHaveLength(37);
  });

  it("creates 61 blocks for radius 4", () => {
    expect(createHexGrid(4)).toHaveLength(61);
  });

  it("all blocks satisfy x+y+z=0", () => {
    createHexGrid(3).forEach(({ x, y, z }) => {
      expect(x + y + z).toBe(0);
    });
  });

  it("all blocks start with value 0", () => {
    createHexGrid(2).forEach(({ value }) => {
      expect(value).toBe(0);
    });
  });
});

describe("findNextBlock", () => {
  const grid = createHexGrid(1);

  it("returns the block in the given direction", () => {
    const result = findNextBlock(tile(0, 0, 0), "north", grid);
    expect(result).toMatchObject({ x: 0, y: 1, z: -1 });
  });

  it("returns false when no block exists in that direction", () => {
    const result = findNextBlock(tile(0, 1, -1), "north", grid);
    expect(result).toBe(false);
  });
});

describe("validMovementsAvailable", () => {
  it("returns true when an empty block is adjacent", () => {
    const grid = createHexGrid(1);
    const tiles = [tile(0, 0, 0)];
    expect(validMovementsAvailable(tiles, grid)).toBe(true);
  });

  it("returns true when a mergeable tile is adjacent", () => {
    const grid = createHexGrid(1);
    grid.forEach((b) => { b.value = 4; });
    const center = grid.find((b) => b.x === 0 && b.y === 0 && b.z === 0)!;
    center.value = 2;
    const north = grid.find((b) => b.x === 0 && b.y === 1 && b.z === -1)!;
    north.value = 2;
    const tiles = [tile(0, 0, 0, 2)];
    expect(validMovementsAvailable(tiles, grid, ["north"])).toBe(true);
  });

  it("returns false when all adjacent blocks are occupied with different values", () => {
    const grid = createHexGrid(1);
    grid.forEach((b) => { b.value = 4; });
    const tiles = [tile(0, 0, 0, 2)];
    expect(validMovementsAvailable(tiles, grid)).toBe(false);
  });
});

describe("sortTileSet", () => {
  const tiles = [
    tile(1, -1, 0),
    tile(-1, 1, 0),
    tile(0, 0, 0),
  ];

  it("sorts northWest: ascending x, descending y", () => {
    const result = sortTileSet(tiles, "northWest");
    expect(result[0].x).toBeLessThanOrEqual(result[1].x);
  });

  it("sorts south: ascending y", () => {
    const result = sortTileSet(tiles, "south");
    expect(result[0].y).toBeLessThanOrEqual(result[1].y);
  });

  it("does not mutate the original array", () => {
    const original = [...tiles];
    sortTileSet(tiles, "north");
    expect(tiles).toEqual(original);
  });
});

describe("addIds", () => {
  it("adds an id to each element", () => {
    const result = addIds([tile(0, 0, 0), tile(1, -1, 0)]);
    result.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe("number");
    });
  });

  it("does not mutate the original elements", () => {
    const original = tile(0, 0, 0);
    addIds([original]);
    expect(original.id).toBeUndefined();
  });
});
