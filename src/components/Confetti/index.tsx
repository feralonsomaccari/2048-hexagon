import React from "react";
import styles from "./Confetti.module.css";

type Props = {
  /** Number of confetti pieces to drop. */
  count?: number;
};

// Palette pulled from the tile colors so the confetti feels of-a-piece with the board.
const COLORS = [
  "#f2b179",
  "#f67c5f",
  "#edcf72",
  "#edc22e",
  "#2f8f83",
  "#3f6fd1",
  "#8a4f9e",
];

// A purely decorative, dependency-free confetti burst. Each piece gets a
// randomized start position, color, delay and fall duration so the burst
// doesn't look mechanically uniform. The whole thing is aria-hidden and is
// suppressed for users who prefer reduced motion (handled in CSS).
const Confetti = ({ count = 80 }: Props): React.ReactElement => {
  // Generate the pieces once per mount so they don't reshuffle on re-render.
  const pieces = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        left: Math.random() * 100, // % across the container
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.6, // s
        duration: 2.4 + Math.random() * 1.6, // s
        drift: Math.random() * 60 - 30, // px sideways
        rotate: Math.random() * 360, // deg
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
