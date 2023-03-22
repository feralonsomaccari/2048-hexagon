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
}
