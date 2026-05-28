import styles from "./PowerUpBar.module.css";
import UndoIcon from "../UndoIcon";
import NewGameIcon from "../NewGameIcon";
import { POWER_UPS, PowerUpId } from "../../config/gameConfig";

type PowerUpState = {
  onActivate?: () => void;
  disabled?: boolean;
  charges?: number;
  maxCharges?: number;
};

type props = {
  powerUps: Partial<Record<PowerUpId, PowerUpState>>;
};

const ICONS: Record<PowerUpId, React.FC<{ className?: string }>> = {
  undo: UndoIcon,
  newGame: NewGameIcon,
};

const PowerUpBar = ({ powerUps }: props) => {
  const active = POWER_UPS.filter((def) => powerUps[def.id]);
  if (active.length === 0) return null;

  return (
    <nav className={styles.powerUpBar} data-testid="power-up-bar" aria-label="Power-ups">
      <ul className={styles.list}>
        {active.map((def) => {
          const state = powerUps[def.id]!;
          const Icon = ICONS[def.id];
          const hasCharges = state.maxCharges !== undefined && state.maxCharges > 0;
          const charges = state.charges ?? 0;
          const isDisabled = state.disabled || (hasCharges && charges === 0);
          const ariaLabel = hasCharges
            ? `${def.description}, ${charges} remaining`
            : def.description;

          return (
            <li key={def.id} className={styles.item}>
              <button
                type="button"
                className={styles.tile}
                onClick={state.onActivate}
                disabled={isDisabled}
                title={def.description}
                data-testid={`power-up-${def.id}`}
                aria-label={ariaLabel}
              >
                <Icon className={styles.icon} />
                {hasCharges && (
                  <span className={styles.badge} data-testid={`power-up-${def.id}-charges`} aria-hidden="true">
                    {charges}
                  </span>
                )}
              </button>
              <span className={styles.label}>{def.label}</span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default PowerUpBar;
