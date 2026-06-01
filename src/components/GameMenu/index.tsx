import { useEffect, useRef, useState } from "react";
import styles from "./GameMenu.module.css";
import Button from "../Button";
import TrophyIcon from "../TrophyIcon";
import AchievementsIcon from "../AchievementsIcon";
import LightModeIcon from "../LightModeIcon";
import DarkModeIcon from "../DarkModeIcon";
import MuteIcon from "../MuteIcon";
import UnmuteIcon from "../UnmuteIcon";
import TwitterIcon from "../TwitterIcon";
import FacebookIcon from "../FacebookIcon";

type props = {
  scores?: React.ReactNode;
  topScore?: React.ReactNode;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onHighScoresHandler?: () => void;
  onAchievementsHandler?: () => void;
  isMuted?: boolean;
  onToggleMuted?: () => void;
  onShareTwitter?: () => void;
  onShareFacebook?: () => void;

  isWin?: boolean;
  isGameOver?: boolean;
};

const GameMenu = ({
  scores,
  topScore,
  theme,
  onToggleTheme,
  onHighScoresHandler,
  onAchievementsHandler,
  isMuted,
  onToggleMuted,
  onShareTwitter,
  onShareFacebook,
  isWin = false,
  isGameOver = false,
}: props) => {
  const isEnded = isWin || isGameOver;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenuAndRefocus = () => {
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {

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

  const runAndClose = (handler?: () => void) => () => {
    handler?.();
    closeMenuAndRefocus();
  };

  const hasMenuItems = Boolean(onHighScoresHandler || onAchievementsHandler || onToggleTheme || onToggleMuted || onShareTwitter || onShareFacebook);

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
                  {onAchievementsHandler && (
                    <Button
                      clickHandler={runAndClose(onAchievementsHandler)}
                      text={
                        <span className={styles.menuItemLabel}>
                          <AchievementsIcon className={styles.menuItemIcon} />
                          Achievements
                        </span>
                      }
                      extraProps={{
                        title: "View achievements",
                        "data-testid": "achievements-btn",
                        "aria-label": "View achievements",
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
                  {onShareTwitter && (
                    <Button
                      clickHandler={runAndClose(onShareTwitter)}
                      text={
                        <span className={styles.menuItemLabel}>
                          <TwitterIcon className={styles.menuItemIcon} />
                          Share on Twitter
                        </span>
                      }
                      extraProps={{
                        title: "Share on Twitter",
                        "data-testid": "share-twitter-btn",
                        "aria-label": "Share on Twitter",
                      }}
                    />
                  )}
                  {onShareFacebook && (
                    <Button
                      clickHandler={runAndClose(onShareFacebook)}
                      text={
                        <span className={styles.menuItemLabel}>
                          <FacebookIcon className={styles.menuItemIcon} />
                          Share on Facebook
                        </span>
                      }
                      extraProps={{
                        title: "Share on Facebook",
                        "data-testid": "share-facebook-btn",
                        "aria-label": "Share on Facebook",
                      }}
                    />
                  )}
                  <p className={styles.menuAttribution}>
                    Based on 2048 by{" "}
                    <a href="https://play2048.co/" target="_blank" rel="noopener">
                      Gabriele Cirulli
                    </a>
                    {" · v"}{__APP_VERSION__}
                  </p>
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
      <div className={`${styles.collapsible} ${isEnded ? styles.collapsed : ""}`} aria-hidden={isEnded}>
      <div className={styles.collapsibleInner}>
      <div className={styles.divider} />
      <div className={styles.bottom}>
        {topScore && <span className={styles.topScoreLegend}>{topScore}</span>}
      </div>
      </div>
      </div>
    </header>
  );
};

export default GameMenu;
