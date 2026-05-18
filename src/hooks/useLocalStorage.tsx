import { useState, useEffect } from "react";

const getStoredValue = <T,>(key: string, initialValue: T): T => {
  const storedValue = JSON.parse(localStorage?.getItem(key) || "{}");
  if (storedValue && Object.keys(storedValue).length) return storedValue as T;
  return initialValue;
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => getStoredValue(key, initialValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
