import React from "react";
import styles from "./Snowfall.module.css";

type Props = {
  count?: number;
};

const FLAKES = ["❄", "❅", "❆"];

const Snowfall = ({ count = 28 }: Props): React.ReactElement => {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        left: Math.random() * 100,
        glyph: FLAKES[i % FLAKES.length],
        delay: Math.random() * 2.4,
        duration: 3 + Math.random() * 3,
        drift: Math.random() * 50 - 25,
        scale: 0.5 + Math.random() * 0.8,
      })),
    [count]
  );

  return (
    <div className={styles.snowfall} data-testid="snowfall" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className={styles.flake}
          style={
            {
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--scale": p.scale,
            } as React.CSSProperties
          }
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
};

export default Snowfall;
