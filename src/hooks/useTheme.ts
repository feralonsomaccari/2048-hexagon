import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

export type Theme = "light" | "dark";

// Browser-chrome color per theme — keep in sync with the page background tokens
// in index.css (light `--color-tertiary`, dark `--color-bg-page`).
const THEME_COLOR: Record<Theme, string> = {
  light: "#bbada0",
  dark: "#1d1b17",
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Match the browser's UI chrome (address bar etc.) to the active theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return [theme, toggleTheme];
};

export default useTheme;
