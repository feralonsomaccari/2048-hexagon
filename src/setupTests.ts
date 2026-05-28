import "@testing-library/jest-dom/vitest";

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
