import { useEffect, useRef, useState } from "react";
import styles from "./GameMenu.module.css";
import Button from "../Button";
import UndoIcon from "../UndoIcon";
import TrophyIcon from "../TrophyIcon";
import LightModeIcon from "../LightModeIcon";
import DarkModeIcon from "../DarkModeIcon";
import MuteIcon from "../MuteIcon";
import UnmuteIcon from "../UnmuteIcon";

type props = {
  onNewGameHandler?: () => void;
  undoHandler?: () => void;
  isUndoAvailable?: boolean;
  remainingUndos?: number;
  maxUndos?: number;
  showUndo?: boolean;
  scores?: React.ReactNode;
  topScore?: React.ReactNode;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onHighScoresHandler?: () => void;
  isMuted?: boolean;
  onToggleMuted?: () => void;
};

const GameMenu = ({
  undoHandler,
  onNewGameHandler,
  isUndoAvailable = true,
  remainingUndos,
  maxUndos,
  showUndo = true,
  scores,
  topScore,
  theme,
  onToggleTheme,
  onHighScoresHandler,
  isMuted,
  onToggleMuted,
}: props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close the dropdown and return focus to the trigger, so keyboard users aren't
  // stranded on <body> after Escape or activating an item.
  const closeMenuAndRefocus = () => {
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  };

  // Close the dropdown on an outside click or the Escape key. Only listen while
  // the menu is open so we don't keep handlers attached needlessly.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Outside click: just close; don't yank focus back to the trigger.
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenuAndRefocus();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Run the chosen action, then close the menu and restore focus to the trigger.
  const runAndClose = (handler?: () => void) => () => {
    handler?.();
    closeMenuAndRefocus();
  };

  const hasMenuItems = Boolean(onHighScoresHandler || onToggleTheme || onToggleMuted);

  return (
    <header data-testid="game-menu" className={styles.gameMenu}>
      <div className={styles.top}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title} aria-label="2048 Hexagon">
            <span aria-hidden="true">2048 ⬡</span>
          </h1>
          {hasMenuItems && (
            <div className={styles.menu} ref={menuRef}>
              <button
                ref={triggerRef}
                type="button"
                className={styles.hamburger}
                onClick={() => setIsMenuOpen((open) => !open)}
                title="More options"
                data-testid="menu-toggle-btn"
                aria-label="More options"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                aria-controls="game-menu-dropdown"
              >
                <span className={styles.hamburgerBar} aria-hidden="true" />
                <span className={styles.hamburgerBar} aria-hidden="true" />
                <span className={styles.hamburgerBar} aria-hidden="true" />
              </button>
              {isMenuOpen && (
                <div
                  id="game-menu-dropdown"
                  className={styles.menuDropdown}
                  data-testid="menu-dropdown"
                  role="group"
                  aria-label="More options"
                >
                  {onHighScoresHandler && (
                    <Button
                      clickHandler={runAndClose(onHighScoresHandler)}
                      text={
                        <span className={styles.menuItemLabel}>
                          <TrophyIcon className={styles.menuItemIcon} />
                          Scores
                        </span>
                      }
                      extraProps={{
                        title: "View high scores",
                        "data-testid": "high-scores-btn",
                        "aria-label": "View high scores",
                      }}
                    />
                  )}
                  {onToggleTheme && (
                    <Button
                      clickHandler={runAndClose(onToggleTheme)}
                      text={
                        <span className={styles.menuItemLabel}>
                          {theme === "dark" ? (
                            <LightModeIcon className={styles.menuItemIcon} />
                          ) : (
                            <DarkModeIcon className={styles.menuItemIcon} />
                          )}
                          {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                      }
                      extraProps={{
                        title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
                        "data-testid": "theme-toggle-btn",
                        "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
                      }}
                    />
                  )}
                  {onToggleMuted && (
                    <Button
                      clickHandler={runAndClose(onToggleMuted)}
                      text={
                        <span className={styles.menuItemLabel}>
                          {isMuted ? (
                            <MuteIcon className={styles.menuItemIcon} />
                          ) : (
                            <UnmuteIcon className={styles.menuItemIcon} />
                          )}
                          {isMuted ? "Unmute" : "Mute"}
                        </span>
                      }
                      extraProps={{
                        title: isMuted ? "Unmute sound" : "Mute sound",
                        "data-testid": "sound-toggle-btn",
                        "aria-label": isMuted ? "Unmute sound" : "Mute sound",
                        "aria-pressed": isMuted,
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <span className={styles.subtitle}>
            hexagon<span className={styles.subtitleVersion}> version</span>
          </span>
          <p className={styles.srOnly}>
            A hexagonal twist on the classic 2048 puzzle game. Slide and merge tiles on a hex grid to reach 2048.
            Move tiles using the keys Q, W, E, A, S, D or the arrow keys. On touch devices, swipe in any of the six directions.
          </p>
        </div>
        {scores && <div className={styles.scores}>{scores}</div>}
      </div>
      <div className={styles.divider} />
      <div className={styles.bottom}>
        <Button
          clickHandler={onNewGameHandler}
          text="New Game"
          extraProps={{
            title: "Start a new game",
            "data-testid": "new-game-btn",
            "aria-label": "Start a new game",
          }}
        />
        <div className={styles.actionsRight}>
          {showUndo && (
            <Button
              clickHandler={undoHandler}
              disabled={!isUndoAvailable || remainingUndos === 0}
              text={
                <span className={styles.undoLabel}>
                  <UndoIcon className={styles.undoIcon} />
                  {remainingUndos !== undefined && (maxUndos ?? 0) > 0 && (
                    <span className={styles.undoPips} data-testid="undo-pips" aria-hidden="true">
                      {/* Always show at least 3 slots so a 1-undo budget still
                          reads as a bar (e.g. 1 filled + 2 empty). */}
                      {Array.from({ length: Math.max(3, maxUndos ?? 0) }, (_, i) => (
                        <span
                          key={i}
                          data-pip={i < remainingUndos ? "filled" : "empty"}
                          className={`${styles.undoPip} ${i < remainingUndos ? styles.undoPipFilled : ""}`}
                        />
                      ))}
                    </span>
                  )}
                </span>
              }
              extraProps={{
                title: "Undo last action",
                "data-testid": "undo-btn",
                "aria-label":
                  remainingUndos !== undefined
                    ? `Undo last action, ${remainingUndos} remaining`
                    : "Undo last action",
              }}
            />
          )}
          {topScore && <span className={styles.topScoreLegend}>{topScore}</span>}
        </div>
      </div>
    </header>
  );
};

export default GameMenu;
