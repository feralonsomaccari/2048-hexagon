import styles from "./AchievementsPanel.module.css";
import AchievementsIcon from "../AchievementsIcon";
import {
  ALL_ACHIEVEMENTS,
  ACHIEVEMENT_GROUP_LABELS,
  ACHIEVEMENT_GROUP_ORDER,
  AchievementGroup,
} from "../../config/achievements";

type props = {
  unlockedIds: Set<string>;
};

const AchievementsPanel = ({ unlockedIds }: props) => {
  const total = ALL_ACHIEVEMENTS.length;
  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length;

  return (
    <div className={styles.panel} data-testid="achievements-panel">
      <p className={styles.summary}>
        {unlockedCount} / {total} unlocked
      </p>
      {ACHIEVEMENT_GROUP_ORDER.map((group: AchievementGroup) => {
        const items = ALL_ACHIEVEMENTS.filter((a) => a.group === group);
        if (!items.length) return null;
        return (
          <section key={group} className={styles.group}>
            <h4 className={styles.groupTitle}>{ACHIEVEMENT_GROUP_LABELS[group]}</h4>
            <ul className={styles.list}>
              {items.map((a) => {
                const unlocked = unlockedIds.has(a.id);
                return (
                  <li
                    key={a.id}
                    className={`${styles.item} ${unlocked ? styles.unlocked : styles.locked}`}
                    data-testid={`achievement-${a.id}`}
                  >
                    <span className={styles.itemIcon} aria-hidden="true">
                      <AchievementsIcon size={24} />
                    </span>
                    <span className={styles.itemBody}>
                      <span className={styles.itemName}>{a.name}</span>
                      <span className={styles.itemDescription}>{a.description}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default AchievementsPanel;
