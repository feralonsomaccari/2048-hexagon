import styles from "./PowerUpBar.module.css";
import UndoIcon from "../UndoIcon";
import RemoveIcon from "../RemoveIcon";
import SwapIcon from "../SwapIcon";
import FreezeIcon from "../FreezeIcon";
import DoubleIcon from "../DoubleIcon";
import NewGameIcon from "../NewGameIcon";
import { POWER_UPS, PowerUpId } from "../../config/gameConfig";

type PowerUpState = {
  onActivate?: () => void;
  disabled?: boolean;
  charges?: number;
  maxCharges?: number;
  active?: boolean;
};

type props = {
  powerUps: Partial<Record<PowerUpId, PowerUpState>>;
};

const ICONS: Record<PowerUpId, React.FC<{ className?: string }>> = {
  undo: UndoIcon,
  removeTile: RemoveIcon,
  swap: SwapIcon,
  freeze: FreezeIcon,
  double: DoubleIcon,
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
          const isActive = state.active ?? false;
          const ariaLabel = hasCharges
            ? `${def.description}, ${charges} remaining`
            : def.description;

          const tooltipId = `power-up-tip-${def.id}`;

          return (
            <li key={def.id} className={styles.item}>
              <button
                type="button"
                className={`${styles.tile} ${isActive ? styles.tileActive : ""}`}
                onClick={state.onActivate}
                disabled={isDisabled}
                data-testid={`power-up-${def.id}`}
                aria-label={ariaLabel}
                aria-describedby={tooltipId}
                aria-pressed={state.active !== undefined ? isActive : undefined}
              >
                <Icon className={`${styles.icon} ${styles[`icon-${def.id}`] ?? ""}`} />
                {hasCharges && (
                  <span className={styles.badge} data-testid={`power-up-${def.id}-charges`} aria-hidden="true">
                    {charges}
                  </span>
                )}
              </button>
              <span className={styles.label}>{def.label}</span>
              <div
                id={tooltipId}
                role="tooltip"
                className={styles.tooltip}
                data-testid={`power-up-${def.id}-tooltip`}
              >
                <span className={styles.tooltipTitle}>{def.label}</span>
                <span className={styles.tooltipDesc}>{def.description}</span>
                {hasCharges && (
                  <span className={styles.tooltipCharges}>
                    {charges} of {state.maxCharges} remaining
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default PowerUpBar;
