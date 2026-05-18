// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}
