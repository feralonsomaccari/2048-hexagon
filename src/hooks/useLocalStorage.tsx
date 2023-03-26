import { useState, useEffect } from "react";

const getStoredValued = (key: string, initialValue: any) => {
  const localStoraItem = localStorage?.getItem(key);
  if (!localStoraItem) return;
  const storedValue = JSON.parse(localStoraItem);

  if (storedValue) return storedValue;
  return initialValue;
};

const useLocalStorage = (key: string, initialValue: any) => {
  const [value, setValue] = useState<any>(() => {
    return getStoredValued(key, initialValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
};

export default useLocalStorage;
