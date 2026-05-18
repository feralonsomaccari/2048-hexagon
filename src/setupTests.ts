import "@testing-library/jest-dom/vitest";

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}
