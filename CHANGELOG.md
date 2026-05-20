# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
