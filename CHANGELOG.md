# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.4.4] - 2026-05-20

### Added
- Visible `:focus-visible` outlines for all interactive elements: primary `Button`, `NewGameMenu` size cards, the `Leaderboard` name input, and the `Modal` close button.
- `aria-label`s on the Undo / New Game / Scores buttons (Undo includes the remaining-undo count, e.g. `"Undo last action, 2 remaining"`).
- Screen-reader keyboard hint in `GameMenu`'s sr-only description: explicit Q/W/E/A/S/D and arrow-key controls plus the swipe alternative.
- Keyboard controls also called out inline in the visible `Instructions` copy on touch devices.
- `aria-live="polite"` on the leaderboard row currently highlighted as the player's entry, so assistive tech announces rank changes.

### Changed
- `GameMenu` root element is now a `<header>` (was `<article>`) so the page lands have a proper banner landmark.
- Game-over / win overlay now sets `aria-modal="true"` and `aria-atomic="true"` so screen readers treat it as a true modal dialog.



### Changed
- Leaderboard now lists the **top 3** per board (was top 4). Firestore listeners fetch fewer docs and the modal is more compact.
- Leaderboard board sections now reserve a `min-height` of 88px (was 118px) to match the trimmed row count.

## [0.4.2] - 2026-05-20

### Changed
- Undo budget now varies by board size to add pressure on larger boards:
  - Small (radius 1): 3 undos (unchanged).
  - Medium (radius 2): **1 undo**.
  - Large (radius 3): **0 undos** — Undo button is hidden.
  - XL (radius 4): **0 undos** — Undo button is hidden.

## [0.4.1] - 2026-05-20

### Changed
- High-score submit prompt now distinguishes between qualifying and topping: shows **"New high score"** when the player beats the current #3 entry (i.e., breaks into the top 3), and **"You scored"** when they qualify for the leaderboard (top 4) but don't crack the top 3.
- `game-over` status pill is now also hidden on mobile (≤480px). Previously only the "playing" pill was hidden; the red pill remained visible.
- Status pill on desktop is slightly smaller (font 12px → 11px, padding 3/10 → 2/8).
- Score and Best pills now have a fixed `width: 100px` on desktop so they don't shift horizontally as the digit count changes.

## [0.4.0] - 2026-05-20

### Added
- Realtime leaderboard via Firestore `onSnapshot` listeners — top scores update across every open client the instant a new entry lands, no manual refresh.
- Triple-spawn mechanic on the XL board: 10% of post-move spawns now drop three new tiles at once.
- Visible undo counter on the Undo button (`Undo (n)`) that decrements with each use; button disables at 0.
- Unit tests for the visible undo counter (in `GameMenu`) and the end-to-end undo budget (in `App`).
- Firebase mocked in App tests so the suite no longer initializes the real SDK.

### Changed
- Leaderboard now lists the **top 4** per board (was top 5) to keep the modal compact.
- Difficulty rebalance for Medium/Large/XL — pressure now scales more aggressively so larger boards don't feel forgiving:
  - Medium (radius 3): P(4) 12% → 15%; P(double) 15% → 25%.
  - Large (radius 4): P(4) 14% → 20%; P(double) 30% → 60%.
  - XL (radius 5): P(4) 16% → 25%; P(double) 45% → 75%; added 10% P(triple).
  - Small is unchanged (classic 2048 baseline).
- Score animation styling cleaned up: removed the white text-shadow halo, lighter font weight (700), tighter letter-spacing. Color now matches the "playing" status pill — dark forest green in light mode (`#2d6a4f`), light mint in dark mode (`#95d5b2`).
- Top-score legend below "How to play" is now left-aligned and reserves `min-height` so the board doesn't shift when the leaderboard finishes loading.
- Leaderboard board sections reserve a `min-height` equivalent to four rows so the modal stays the same size whether boards are empty, loading, or fully populated.
- Footer slightly shrunk and softened to 50% opacity.

### Fixed
- Off-by-one in the undo budget: players now actually get 3 undos per game instead of 2.
- Best pill no longer fires the `+N` pop animation. Previously, any change to the global #1 (initial leaderboard load, switching boards, a remote update) caused the animation to render `+<full new best>` on the Best pill. The animation now only fires on the Score pill, which is the only one that receives a `historyScore`.
- Submit prompt on the win overlay: previously only `game-over` set `pendingHighScore`, so reaching 2048 produced a win banner without a name-entry field. The hook now also flips `pendingHighScore` when `isWin` becomes true.
- Duplicate score submissions caused by both the form's `onSubmit` and the inner button's click handler firing. The Save button is now `type="submit"` and the form is the single submission path.

## [0.3.0] - 2026-05-20

### Added
- Cross-device leaderboard backed by Firebase Firestore: scores are stored remotely so players from different browsers and devices share a single leaderboard. Falls back to a loading state while the initial fetch is in flight.
- Configurable undo budget per game: undo is now capped at `MAX_UNDO` uses per game.
- Top-score legend below the "How to play" line showing the global #1 for the current board size; a fixed `min-height` reserves the row so the layout does not shift when scores load.
- Win overlay now also triggers the high-score prompt (previously only game-over did), so reaching 2048 lets you submit your name.
- Footer credits Gabriele Cirulli (creator of the original 2048).
- Unit tests for the high-score utilities (`qualifiesForHighScore`, `insertHighScore`) and the `useRemoteHighScores` hook (with Firestore mocked), covering validation, dedup, error handling, and the no-Firebase fallback.

### Changed
- Leaderboard entries are deduplicated per player per board: documents use a deterministic ID (`{radius}_{lowercase-name}`) and submissions overwrite the existing doc only when the new score is higher.
- Firestore security rules tightened to forbid lowering a score on update and to forbid moving a doc between boards.
- Footer is softened (smaller font, 50% opacity) so it sits more quietly at the bottom of the page.
- High-score submit prompt button is now a single `type="submit"`, eliminating a double-fire that produced duplicate entries.

### Removed
- localStorage as the source of truth for the leaderboard. Firestore is now the only source; any stale `highScores` key in localStorage is wiped on first load of this version. Personal-best (`maxScore`) is still stored locally per board size.

### Added
- Dark mode: theme toggle in the menu, persisted in `localStorage` under `theme`. First-time visitors default to their system preference (`prefers-color-scheme`).
- Local high-score leaderboard: top 5 scores per board size, stored in `localStorage` under `highScores`. On game over, qualifying scores prompt the player for a name and are inserted into the list. A "Scores" button in the menu opens a leaderboard panel with all four board sizes.
- App version is now displayed in the footer, sourced from `package.json` at build time.

### Changed
- Spawn logic now matches classic 2048 on the Small board: one tile per move, 90% chance of 2 and 10% chance of 4.
- Difficulty scales with board size so larger boards feel roughly as challenging as Small:
  - Small (radius 2): P(4) = 10%, P(double spawn) = 0%.
  - Medium (radius 3): P(4) = 12%, P(double spawn) = 15%.
  - Large (radius 4): P(4) = 14%, P(double spawn) = 30%.
  - XL (radius 5): P(4) = 16%, P(double spawn) = 45%.
- The "playing" status pill is hidden on mobile (≤480px) to save space; the "game-over" pill still shows.
- Modal supports a configurable `title` prop (defaults to "New Game"); the leaderboard modal uses "High Scores".

### Removed
- Uniform 20% double-spawn and 50/50 value split across all board sizes (previous behavior made small boards disproportionately hard).
