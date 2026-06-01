import { useCallback, useEffect, useState } from "react";
import styles from "./AchievementToast.module.css";
import AchievementsIcon from "../AchievementsIcon";
import { Achievement } from "../../config/achievements";
import { playSound, vibrate } from "../../utils/soundManager";

const TOAST_DURATION = 4000;
const EXIT_DURATION = 240;

type ToastProps = {
  achievement: Achievement;
  onDismiss: (id: string) => void;
};

const AchievementToast = ({ achievement, onDismiss }: ToastProps) => {
  const [leaving, setLeaving] = useState(false);

  const beginLeave = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    playSound("achievement");
    vibrate("achievement");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(beginLeave, TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [beginLeave]);

  useEffect(() => {
    if (!leaving) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const delay = prefersReducedMotion ? 0 : EXIT_DURATION;
    const timer = window.setTimeout(() => onDismiss(achievement.id), delay);
    return () => window.clearTimeout(timer);
  }, [leaving, achievement.id, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${leaving ? styles.leaving : ""}`}
      role="status"
      data-testid="achievement-toast"
    >
      <span className={styles.icon} aria-hidden="true">
        <AchievementsIcon size={28} />
      </span>
      <div className={styles.body}>
        <p className={styles.label}>Achievement unlocked</p>
        <p className={styles.name}>{achievement.name}</p>
        <p className={styles.description}>{achievement.description}</p>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={beginLeave}
        aria-label="Dismiss"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
};

type props = {
  queue: Achievement[];
  onDismiss: (id: string) => void;
};

const AchievementToasts = ({ queue, onDismiss }: props) => {
  if (!queue.length) return null;
  return (
    <div className={styles.stack} data-testid="achievement-toasts">
      {queue.map((achievement) => (
        <AchievementToast key={achievement.id} achievement={achievement} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default AchievementToasts;
