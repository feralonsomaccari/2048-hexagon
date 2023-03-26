import { useState, useEffect } from "react";

const getStoredValued = (key: string, initialValue: any) => {
  const storedValue = JSON.parse(localStorage?.getItem(key) || '{}');
  if (storedValue && Object.keys(storedValue).length) return storedValue;

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
