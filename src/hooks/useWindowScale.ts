import { useState, useEffect } from "react";

const DESIGN_WIDTH = 600;

const getScale = () => Math.min(1, window.innerWidth / DESIGN_WIDTH);

const useWindowScale = () => {
  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    const handler = () => setScale(getScale());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return scale;
};

export default useWindowScale;
