import styles from "./AdSlot.module.css";

type Placement = "top" | "desktop-left" | "desktop-right";

type props = {
  placement?: Placement;
  showPlaceholder?: boolean;
};

const PLACEMENT_CLASS: Record<Placement, string> = {
  top: styles.top,
  "desktop-left": styles.desktopLeft,
  "desktop-right": styles.desktopRight,
};

const PLACEHOLDER_LABEL: Record<Placement, string> = {
  top: "",
  "desktop-left": "Ad 160×600",
  "desktop-right": "Ad 160×600",
};

const AdSlot = ({
  placement = "top",
  showPlaceholder = false,
}: props): JSX.Element | null => {
  if (!showPlaceholder) {
    return null;
  }

  return (
    <aside
      className={`${styles.adSlot} ${PLACEMENT_CLASS[placement]}`}
      data-testid={`ad-slot-${placement}`}
      aria-hidden="true"
    >
      <div className={styles.adInner}>
        <span className={styles.placeholder} data-label={PLACEHOLDER_LABEL[placement]} />
      </div>
    </aside>
  );
};

export default AdSlot;
