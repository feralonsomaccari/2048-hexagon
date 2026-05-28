import React from "react";
import styles from "./Confetti.module.css";

type Props = {

  count?: number;
};

const COLORS = [
  "#f2b179",
  "#f67c5f",
  "#edcf72",
  "#edc22e",
  "#2f8f83",
  "#3f6fd1",
  "#8a4f9e",
];

const Confetti = ({ count = 80 }: Props): React.ReactElement => {

  const pieces = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 1.6,
        drift: Math.random() * 60 - 30,
        rotate: Math.random() * 360,
        scale: 0.7 + Math.random() * 0.6,
      })),
    [count]
  );

  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className={styles.piece}
          style={
            {
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rotate": `${p.rotate}deg`,
              "--scale": p.scale,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default Confetti;
