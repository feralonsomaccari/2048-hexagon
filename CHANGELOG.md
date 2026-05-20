# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.0] - 2026-05-20

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
