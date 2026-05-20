import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

export type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return [theme, toggleTheme];
};

export default useTheme;
