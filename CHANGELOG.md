# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- Spawn logic now matches classic 2048 on the Small board: one tile per move, 90% chance of 2 and 10% chance of 4.
- Difficulty scales with board size so larger boards feel roughly as challenging as Small:
  - Small (radius 2): P(4) = 10%, P(double spawn) = 0%.
  - Medium (radius 3): P(4) = 12%, P(double spawn) = 15%.
  - Large (radius 4): P(4) = 14%, P(double spawn) = 30%.
  - XL (radius 5): P(4) = 16%, P(double spawn) = 45%.

### Removed
- Uniform 20% double-spawn and 50/50 value split across all board sizes (previous behavior made small boards disproportionately hard).
