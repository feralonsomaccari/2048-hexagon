# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.23.2] - 2026-06-01

### Changed
- Reworked the Small board achievement tiers, now topping out at a 2048 win.

## [0.23.1] - 2026-06-01

### Fixed
- Prevented re-submitting your name on the high-score prompt while the save is in progress.

## [0.23.0] - 2026-06-01

### Added
- Achievements with unlock toasts and a panel listing progress.

### Changed
- Renamed the Normal board to Big, made Small the default, and listed Small first on the leaderboard.

## [0.22.1] - 2026-06-01

### Changed
- Swap and Remove power-up icons updated.

## [0.22.0] - 2026-06-01

### Added
- Hover/focus tooltips on power-ups showing title, description, and charges remaining.

## [0.21.4] - 2026-06-01

### Changed
- Game Over overlay polish — Undo shown as a power-up icon tile, top score hidden, and matching button height and hover bump.

## [0.21.3] - 2026-06-01

### Changed
- Game Over now collapses the power-up bar and How-to-Play before the overlay fades in.

## [0.21.2] - 2026-06-01

### Added
- Dev-only Win / Lose buttons to trigger the end-game overlays (stripped from production builds).

## [0.21.1] - 2026-06-01

### Changed
- New win sound — an ascending flourish timed to the winning-tile shine.

## [0.21.0] - 2026-06-01

### Changed
- Win screen reworked: winning tile shines, then the overlay, confetti and power-up bar fade in over the board.

## [0.20.1] - 2026-06-01

### Changed
- Unused power-up bonus lowered from 5% to 3%.

## [0.20.0] - 2026-06-01

### Added
- Move count shown on each leaderboard entry.

## [0.19.0] - 2026-06-01

### Changed
- Combo points removed — each merge is worth its plain tile value.

## [0.18.0] - 2026-05-29

### Added
- Undo out of a loss — Game Over overlay offers an Undo button when charges remain.

## [0.17.1] - 2026-05-29

### Fixed
- Normal board no longer overflows vertically on desktop.

## [0.17.0] - 2026-05-28

### Added
- Tile-split animation when removing a tile.

## [0.16.0] - 2026-05-28

### Changed
- Win bonus now rewards every unused power-up at 5% each (was 10% per unused undo only).
- Larger Swap and Remove icons in the power-up bar.

### Changed (data)
- Renamed Firestore field `noUndoBonus` → `nonUsedPowerUpBonus` (requires updated Firestore rules).

## [0.15.1] - 2026-05-28

### Added
- New Game menu shows whether each board has power-ups.

## [0.15.0] - 2026-05-28

### Added
- Swap power-up — tap two tiles to exchange their positions.
- Leaderboard submissions record `removesUsed` and `swapsUsed`.

## [0.14.1] - 2026-05-28

### Changed
- Remove power-up now requires a move first.
- New Remove icon — a split hexagon.

## [0.14.0] - 2026-05-28

### Added
- Power-up bar below the board (Undo and New Game moved here).
- Remove power-up — tap a tile to delete it.

## [0.13.0] - 2026-05-28

### Added
- Share on Twitter and Facebook from the hamburger menu.

## [0.12.0] - 2026-05-28

### Added
- Share your win on Twitter from the win panel.

## [0.11.0] - 2026-05-28

### Added
- Animated score count-up on Score and My Best.

### Changed
- Win/Game Over overlay folds move count into the score line.
- Replaced the floating "+N" gain indicator with the count-up animation.

## [0.10.0] - 2026-05-28

### Added
- Move counter shown on the win and Game Over overlay.
- Leaderboard submissions record `movesCount`.

## [0.9.4] - 2026-05-27

### Added
- Haptic feedback on win and game over (Android only).

## [0.9.3] - 2026-05-27

### Fixed
- Win panel no longer flashes and vanishes on a second win.

### Changed
- Coordinated win/exit animations on Try Again.
- New Game / Undo row and How to Play panel collapse and expand smoothly.
- Top-score legend pushed to the far right on desktop.

## [0.9.2] - 2026-05-27

### Changed
- Win panel now stacks below the board on desktop, matching mobile.

## [0.9.1] - 2026-05-27

### Fixed
- Hamburger menu accessibility follow-ups (focus return, corrected ARIA roles).
- `theme-color` now follows the active theme.
- Restored the softer color on the top-score legend and footer link.

### Added
- New Game / High Scores modal pops in with a scale animation.

## [0.9.0] - 2026-05-27

### Added
- Hamburger menu collapsing Scores, theme, and sound toggles into a popup.
- Custom SVG icons for the menu and undo button.

### Changed
- Undo button redesigned with a depleting bar of pips.
- Header bottom-row layout regrouped on desktop and mobile.
- Clearer theme and sound toggle labels.
- Smoother win animation.

## [0.8.1] - 2026-05-26

### Fixed
- Name prompt no longer appears for scores that don't make the top N.

## [0.8.0] - 2026-05-26

### Added
- Confetti on win (dependency-free, respects reduced motion).

### Changed
- Reworked the win overlay to a higher-contrast gold (meets WCAG AA).

### Fixed
- "Enter your name" field border now visible in light mode.

## [0.7.2] - 2026-05-26

### Changed
- Gentler, less repetitive sound effects.

### Fixed
- Win/Game Over overlay now fully covers the board.

## [0.7.1] - 2026-05-26

### Fixed
- Header menu buttons span the full width again.

## [0.7.0] - 2026-05-26

### Added
- Sound effects synthesized in-browser via Web Audio API.
- Sound on/off toggle in the header menu.

### Removed
- The "playing" / "game-over" status badge.

## [0.6.2] - 2026-05-26

### Added
- Combo bonus shown as its own line in the score breakdown.
- Leaderboard submissions record `comboBonus` and `noUndoBonus`.

### Fixed
- "My Best" no longer shows an inflated value mid-game.

### Changed
- Header Score syncs with My Best at end of run.
- No-undo bonus is now banked at the moment of a win.

## [0.6.0] - 2026-05-26

### Added
- No-undo bonus — each unused undo adds +10% of your score.
- Leaderboard submissions record `undosUsed`.

### Changed
- Score box (now "My Best") shows your personal best for the board.

## [0.5.10] - 2026-05-26

### Fixed
- iPhone no longer auto-zooms when focusing the name field.

## [0.5.9] - 2026-05-26

### Fixed
- Large-number tiles no longer overflow the hexagon (font scales with digit count).

## [0.5.8] - 2026-05-25

### Changed
- High scores recorded per submission instead of per name.

## [0.5.7] - 2026-05-25

### Changed
- Win/Game Over overlay polish (trophy icon, score line, button row).

## [0.5.6] - 2026-05-25

### Changed
- Mobile menu layout now activates at ≤600px (was ≤480px).

## [0.5.5] - 2026-05-25

### Changed
- Less crowded mobile action buttons.

## [0.5.4] - 2026-05-25

### Fixed
- Tiles beyond 2048 are no longer rendered without a background color.

## [0.5.3] - 2026-05-25

### Fixed
- Win overlay no longer reappears after choosing Keep Playing.

## [0.5.2] - 2026-05-25

### Changed
- Combo scoring — merges within a move multiply the score.

## [0.5.1] - 2026-05-25

### Fixed
- All text now meets WCAG AA contrast in both themes.

## [0.5.0] - 2026-05-25

### Added
- SEO: HowTo JSON-LD and a free-game Offer on the VideoGame schema.
- Richer Open Graph and Twitter image metadata.
- `public/CNAME` to re-assert the custom domain on each deploy.
- `public/404.html` redirecting unknown URLs to the home page.

### Changed
- Firebase is now lazy-loaded and code-split out of the main bundle.
- Keyword-rich `og:title` / `twitter:title`.
- Aligned `manifest.json` description with the meta description.
- Regenerated `og-image.png` at 1200×630.
- Bumped `sitemap.xml` `lastmod`.

### Fixed
- Corrected heading order (Score titles now `<h2>`).
- Score component padding.

## [0.4.11] - 2026-05-21

### Changed
- Default board radius sourced from `DEFAULT_RADIUS` instead of a hardcoded literal.

## [0.4.10] - 2026-05-21

### Changed
- Centralized all tunable game knobs into `src/config/gameConfig.ts`.
- Re-keyed spawn tables from `radius + 1` to game radius.
- `beatsHighScore` threshold derived from `LEADERBOARD_SIZE - 1`.

### Notes
- The bot keeps its own copy of the spawn tables; sync manually if you tune it.

## [0.4.9] - 2026-05-21

### Changed
- Small board now starts with 2 tiles instead of 3.

### Docs
- README spawn-rules table updated for Small's 2-tile starter.

## [0.4.8] - 2026-05-21

### Changed
- Small board no longer spawns `4` tiles.

### Docs
- README Features line and Spawn rules table updated.

## [0.4.7] - 2026-05-21

### Added
- Last chosen board size persisted to `localStorage`.

### Changed
- Saved-game writes gated on at least one move being made.

## [0.4.6] - 2026-05-21

### Added
- Game progress persists across reloads via `localStorage`.

## [0.4.5] - 2026-05-21

### Changed
- New Game menu offers only Small and Normal sizes.
- Renamed the radius-2 board "Medium" → "Normal".
- Default board size on first load is now Normal.
- Leaderboard lists the top 5 per board, Normal first.
- "Beats high score" indicator compares against the 5th-place entry.

## [0.4.4] - 2026-05-20

### Added
- `:focus-visible` outlines for all interactive elements.
- `aria-label`s on the Undo / New Game / Scores buttons.
- Screen-reader keyboard hint and inline keyboard controls.
- `aria-live` on the player's highlighted leaderboard row.

### Changed
- `GameMenu` root is now a `<header>` banner landmark.
- Game-over / win overlay sets `aria-modal` and `aria-atomic`.
- Leaderboard lists the top 3 per board with a smaller reserved height.

## [0.4.2] - 2026-05-20

### Changed
- Undo budget now varies by board size.

## [0.4.1] - 2026-05-20

### Changed
- High-score prompt distinguishes "New high score" from "You scored".
- `game-over` status pill also hidden on mobile.
- Smaller desktop status pill, fixed-width Score/Best pills.

## [0.4.0] - 2026-05-20

### Added
- Realtime leaderboard via Firestore `onSnapshot`.
- Triple-spawn mechanic on the XL board.
- Visible undo counter on the Undo button.
- Unit tests for the undo counter and budget.
- Firebase mocked in App tests.

### Changed
- Leaderboard lists the top 4 per board.
- Difficulty rebalance for Medium/Large/XL.
- Score animation styling cleaned up.
- Top-score legend left-aligned with reserved height.
- Leaderboard sections reserve four-row height.
- Footer shrunk and softened.

### Fixed
- Off-by-one in the undo budget (now 3 per game).
- Best pill no longer fires the `+N` pop animation.
- Win overlay now triggers the high-score prompt.
- Removed duplicate score submissions.

## [0.3.0] - 2026-05-20

### Added
- Cross-device leaderboard backed by Firestore.
- Configurable undo budget per game.
- Top-score legend below "How to play".
- Win overlay also triggers the high-score prompt.
- Footer credits Gabriele Cirulli.
- Unit tests for high-score utilities and `useRemoteHighScores`.
- Dark mode with a persisted theme toggle.
- Local high-score leaderboard (top 5 per board).
- App version shown in the footer.

### Changed
- Leaderboard entries deduplicated per player per board.
- Firestore rules tightened against lowering or moving scores.
- Footer softened.
- High-score submit button is a single `type="submit"`.
- Spawn logic matches classic 2048 on Small.
- Difficulty scales with board size.
- "Playing" status pill hidden on mobile.
- Modal supports a configurable `title` prop.

### Removed
- localStorage as the source of truth for the leaderboard.
- Uniform double-spawn and value split across board sizes.
