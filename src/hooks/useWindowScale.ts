import { useState, useEffect } from "react";

const MAX_WRAPPER_WIDTH = 600;
const MOBILE_BREAKPOINT = 480;
const MOBILE_PADDING = 24;
const DESKTOP_PADDING = 40;

const getAvailableWidth = () => {
  const viewport = window.innerWidth;
  const isMobile = viewport <= MOBILE_BREAKPOINT;
  const padding = isMobile ? MOBILE_PADDING : DESKTOP_PADDING;
  const width = Math.min(viewport, MAX_WRAPPER_WIDTH) - padding;
  return { width, isMobile };
};

const useViewport = () => {
  const [viewport, setViewport] = useState(getAvailableWidth);

  useEffect(() => {
    const handler = () => setViewport(getAvailableWidth());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return viewport;
};

export default useViewport;
