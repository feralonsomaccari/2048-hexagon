# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.9.1] - 2026-05-27

### Fixed
- Accessibility follow-ups to the new hamburger menu:
  - Closing the menu with Escape or by activating an item now returns focus to the hamburger trigger, so keyboard users are no longer stranded on the page body. (Closing via an outside click leaves focus where the click landed.)
  - Replaced the menu's `role="menu"`/`role="menuitem"` with a plain `role="group"` (labelled "More options") and `aria-haspopup="true"` on the trigger. The previous roles implied arrow-key navigation between items that wasn't implemented; the items are ordinary Tab-navigable buttons, and the ARIA now matches that behavior.
- The browser `theme-color` now follows the active theme (light/dark) instead of staying on the light value, so the mobile address-bar/chrome color matches the page in dark mode.
- Restored the softer color on the top-score legend and the footer "Gabriele Cirulli" link (back to the muted text color).

### Added
- The New Game / High Scores modal now pops in with the same scale animation as the hamburger menu (respects reduced-motion).

## [0.9.0] - 2026-05-27

### Added
- **Hamburger menu** in the header (to the left of the "2048 ⬡" title) that collapses the secondary actions — **Scores**, the theme toggle, and the sound toggle — into a single popup. The popup is styled like the New Game modal window (page-colored surface, rounded, soft shadow), springs open from the trigger with a scale "pop" animation, and closes on outside-click or Escape. Menu items are borderless, left-aligned rows that highlight on hover/focus. Reduced-motion is respected.
- **Custom SVG icons** for the menu and undo button, traced from source artwork and rendered inline with `fill: currentColor` so they match their label color in both themes (no image requests, crisp at any size): an undo arrow, a trophy on **Scores**, sun/moon on the theme toggle, and muted-speaker / speaker-with-waves on the sound toggle.

### Changed
- **Undo button redesigned**: the remaining-undo count is now shown as a depleting bar of pips beneath the undo arrow instead of an `(n)` label. The bar always renders at least three slots, so a one-undo board reads as "1 of 3" rather than a lone pip. The "Undo" wording is preserved for assistive tech via the `aria-label`/tooltip.
- **Header bottom-row layout**: New Game, Undo, and the top-score legend are now grouped together on the left on desktop. The top-score legend ("Top score: … by …") moved out of the page body and into this row. On mobile, New Game and Undo stay on a single line (the legend shrinks rather than the buttons wrapping), and both buttons keep a capped width instead of stretching to fill the row.
- The theme-toggle label is now the clearer **"Light Mode" / "Dark Mode"** (was a bare "Light" / "Dark"), and the sound toggle reads **"Mute" / "Unmute"** with its new icon.
- **Smoother win animation**: the board now shrinks more slowly to make room for the win panel, and the gold result panel waits for that shrink to finish before popping in (with the trophy bouncing in just after), instead of fading in while the board is still moving.

## [0.8.1] - 2026-05-26

### Fixed
- The "enter your name" prompt no longer appears for scores that don't make the top N. The qualification check ran against the remote leaderboard, but if a run ended before that board's scores had loaded, the leaderboard looked empty and any positive score wrongly qualified. The prompt now waits until the board's leaderboard has actually loaded, and re-evaluates if the leaderboard finishes loading after the run ends — so a genuinely qualifying score still gets prompted and a non-qualifying one never does.

## [0.8.0] - 2026-05-26

### Added
- Confetti falls across the board when you win — a dependency-free burst (no added bundle weight), with pieces in the tile palette drifting and tumbling the full height of the win overlay. It's purely decorative (hidden from assistive tech) and is suppressed entirely for users who prefer reduced motion.

### Changed
- Reworked the win overlay's look. The backdrop is now a vibrant gold with deep-brown text, replacing the muddy yellow-on-brown that was low-contrast and hard to read. The new combination meets WCAG AA contrast (≈6.5:1 in light theme, ≈5.7:1 in dark).

### Fixed
- The "Enter your name" field's border is now clearly visible in light mode. It previously used a near-white color, leaving the input hard to make out; it now uses the secondary (brown) color, matching the focus state.

## [0.7.2] - 2026-05-26

### Changed
- Reworked the sound effects to be gentler and less repetitive. Merges now play the same short, soft blip as a move, at a fixed pitch — the merge-streak pitch climb introduced in 0.7.0 has been removed. Every move and merge varies its pitch slightly (±8%) so repeated plays don't sound mechanically identical. All sounds are shorter, and the overall volume has been lowered.

### Fixed
- The win/Game Over overlay now fully covers the board. A leftover transform offset left it sitting ~30px too high for its whole lifetime, exposing a strip of the board along the bottom edge; the entrance slide is now part of the fade-in animation, so the overlay comes to rest covering the board completely.

## [0.7.1] - 2026-05-26

### Fixed
- The header menu buttons span the full width again. Removing the status badge in 0.7.0 had left the button row clustered to one side; the actions row now stretches to fill the width with the buttons spread evenly across it, on both desktop and mobile.

## [0.7.0] - 2026-05-26

### Added
- Sound effects, synthesized in-browser via the Web Audio API (no audio assets, so zero added bundle weight). Moves, merges, wins and Game Over each have their own tone. The merge sound rises in pitch the longer you keep merging across consecutive moves — a "merge streak" — and resets to its base pitch on a move that doesn't merge; the climb eases out so a long run never gets shrill. Audio only starts on the first key/swipe (respecting browser autoplay rules).
- A sound on/off toggle (🔊/🔇) in the header menu, next to the theme toggle. The preference persists across sessions.

### Removed
- The "playing" / "game-over" status badge below the header divider. Game state is already clear from the board and the win/Game Over overlay, so the badge was redundant.

## [0.6.2] - 2026-05-26

### Added
- The win/Game Over overlay now breaks out the **combo bonus** — the extra points earned from chained merges within a single move — as its own line in the score breakdown, alongside the existing no-undo bonus. The "Score" line shows the base merge points, then each bonus is added on top, so the lines sum to the final score. This is purely informational: combo points were already part of the score, so the total is unchanged.
- Leaderboard submissions now also record `comboBonus` and `noUndoBonus` in Firestore alongside the score, for future display/filtering. The combo total is snapshotted with the saved game and reverts on undo. Requires the Firestore rules to allow the two new fields.

### Fixed
- "My Best" no longer shows an inflated value mid-game. Previously the personal best was recorded with the no-undo bonus baked in on every score change, so during play it leapt ahead of the live "Score" (e.g. Score 1000 / My Best 1300). Now "My Best" follows the raw live score during play and is bumped to the bonus-adjusted final score only at end-of-run, matching the leaderboard submission.

### Changed
- The header "Score" now syncs with "My Best" at the end of a run: when the win/Game Over overlay is shown, it displays the bonus-adjusted final score (e.g. both read 666 instead of Score 512 / My Best 666).
- The no-undo bonus is now **banked** at the moment of a win and stays applied through "Keep Playing": the won bonus is locked to a fixed amount, so the header keeps showing it (no longer dropping back to the raw score) and using an undo afterwards no longer shrinks it. The banked bonus persists in the saved game and resets on a new game.

## [0.6.0] - 2026-05-26

### Added
- No-undo bonus: each undo you leave **unused** adds +10% of your score to the final total at the end of a run. The bonus scales with the board's undo budget — Small (3 undos): 0 used → +30%, 1 → +20%, 2 → +10%, 3 → +0%; Normal (1 undo): 0 used → +10%, 1 → +0%; Large/XL (no undos) award nothing. It's evaluated when the score is recorded, so undos used after choosing "Keep Playing" reduce it too. The win/Game Over overlay shows the breakdown (Score + No-undo bonus = Final), and the bonus applies to both the local best score and the leaderboard submission. The live in-game score stays raw; the bonus only materializes at the end.
- Leaderboard submissions now also record how many undos the player used during the run (`undosUsed`), stored alongside the score in Firestore for future display/filtering. Requires the Firestore rules to allow the new field.

### Changed
- The score box (relabeled "My Best") now shows your **personal best** for the current board (stored locally) instead of the global online top score. The global top still appears in the "Top score: … by …" legend below the board.

## [0.5.10] - 2026-05-26

### Fixed
- On iPhone, focusing the "Enter your name" field after a game no longer auto-zooms the page in (which previously left the player to manually zoom back out).

## [0.5.9] - 2026-05-26

### Fixed
- Large-number tiles no longer overflow the hexagon: the tile font size now scales down with digit count (42px up to 4 digits, then 34px / 28px / 24px for 5 / 6 / 7+ digits) so big values like 16384, 131072 and beyond stay legible inside the tile instead of clipping against the edges.

## [0.5.8] - 2026-05-25

### Changed
- High scores are now recorded per submission instead of per name: each saved score is its own leaderboard entry, so a player using the same name twice (e.g. "Liz" 99 then "Liz" 110) keeps both rows rather than overwriting the earlier one. Submissions are written with auto-generated document IDs (`addDoc`) instead of a `radius_name` key, and the previous "only write if higher than the existing entry for that name" check is gone — every qualifying submission is stored. The displayed leaderboard remains capped at the top N per board.

## [0.5.7] - 2026-05-25

### Changed
- Win/Game Over overlay polish: added a 🏆 trophy icon and a "Score: …" line to the win screen, fixed the washed-out win title (now uses the readable main text color over the wash), and placed the "Try Again" / "Keep Playing" buttons in a single row with consistent spacing. The standalone score line is hidden when the high-score name prompt is shown to avoid showing the score twice.

## [0.5.6] - 2026-05-25

### Changed
- Responsive layout: the mobile menu layout now activates at ≤600px (was ≤480px), fixing the cramped/misaligned header in the ~481–582px range where the desktop layout was overflowing. The stacked title, full-width score boxes, wrapping action buttons, hidden game-status badge, and tighter page padding/instructions text all switch at the same 600px threshold for consistency.

## [0.5.5] - 2026-05-25

### Changed
- Mobile (≤480px): the action buttons (New Game, Undo, …) are less crowded — slightly taller (42px) with a smaller font (13px) and tighter horizontal padding, giving a more comfortable tap target and more room between buttons.

## [0.5.4] - 2026-05-25

### Fixed
- Tiles beyond 2048 are no longer rendered without a background color. Values past 2048 now continue the color progression (4096, 8192, 16384, 32768, 65536 each get a distinct color), and any value above the highest tier falls back to a shared "final" color so a super-tile can never appear black/uncolored.

## [0.5.3] - 2026-05-25

### Fixed
- Win overlay no longer reappears after choosing "Keep Playing": once the player dismisses the win screen, forming another winning tile no longer re-triggers the "You reached …!" alert, so play continues uninterrupted until game over. The "kept playing" state is persisted with the saved game.

## [0.5.2] - 2026-05-25

### Changed
- Combo scoring: merges within the same move now multiply the score (1st merge ×1, 2nd ×2, 3rd ×3, etc.), rewarding chained merges and increasing score variance especially on the small board.

## [0.5.1] - 2026-05-25

### Fixed
- Accessibility: all text now meets the WCAG AA contrast minimum (≥4.5:1, ≥3:1 for large text) in both light and dark themes, resolving the "background and foreground colors do not have a sufficient contrast ratio" audit. Removed `opacity`-dimmed text (footer, instructions, top-score legend) in favor of explicit colors, and introduced `--color-text-muted`, `--color-score-box`, and `--color-score-box-text` tokens. Colors were tuned to the lightest values that still pass, to stay close to the original muted palette. Footer links are now underlined so they are distinguishable without relying on color alone.

## [0.5.0] - 2026-05-25

### Added
- SEO: `HowTo` JSON-LD structured data describing how to play, plus a free-game `Offer` on the existing `VideoGame` schema.
- Open Graph image metadata (`og:image:type`, `og:image:width`, `og:image:height`) and `twitter:image:alt` for richer, more reliable social cards.
- `public/CNAME` so every deploy re-asserts the `2048hexagon.com` custom domain on GitHub Pages.
- `public/404.html` that redirects unknown URLs to the home page (with `noindex` and a visible fallback link).

### Changed
- Firebase is now lazy-loaded via dynamic `import()` so the Firestore SDK is code-split out of the main bundle and off the critical render path; high scores load after first paint. `getDb()` is now async and a synchronous `isFirebaseConfigured()` was added so the UI can decide remote-vs-local without pulling in the SDK.
- `og:title` and `twitter:title` now use the full, keyword-rich title instead of the bare brand name.
- Aligned the `manifest.json` description with the meta/Open Graph/Twitter description.
- Regenerated `og-image.png` at the optimal 1200×630 social-card size (padded from the source artwork).
- Bumped `sitemap.xml` `lastmod` to the current date.

### Fixed
- Accessibility: corrected the heading order — the `Score` titles are now `<h2>` instead of `<h3>`, so the document outline descends sequentially from the `<h1>` (resolves the "heading elements not in sequentially-descending order" audit).
- Score component padding.

## [0.4.11] - 2026-05-21

### Changed
- Default board radius on first load is now sourced from `DEFAULT_RADIUS` in `src/config/gameConfig.ts` instead of a hardcoded `2` literal in `App`, so the first-load size lives alongside the other tunable knobs.

## [0.4.10] - 2026-05-21

### Changed
- Centralized all tunable game knobs into `src/config/gameConfig.ts` so difficulty and leaderboard tweaks live in one file:
  - `LEADERBOARD_SIZE` (was `MAX_ENTRIES_PER_BOARD` literal, now re-exported from there for backwards compatibility with existing imports).
  - `MAX_NAME_LENGTH` (player-name cap on the high-score prompt).
  - `MAX_UNDO_BY_RADIUS` (undo budget per board).
  - `BLOCKED_RADIUS_BY_RADIUS` (center-blocked cells per board).
  - `STARTER_SPAWN_COUNT_BY_RADIUS`, `FOUR_PROBABILITY_BY_RADIUS`, `DOUBLE_SPAWN_PROBABILITY_BY_RADIUS`, `TRIPLE_SPAWN_PROBABILITY_BY_RADIUS` (spawn cadence and value mix per board).
- Re-keyed all spawn tables from the old `radius + 1` convention to **game radius** (1 = Small, 2 = Normal, …) for consistency with the rest of the config; `useGameTiles` now passes the game radius directly to `getRNGPoints`.
- `beatsHighScore` threshold in `App` now derived from `LEADERBOARD_SIZE - 1` instead of a hardcoded `[4]` index.

### Notes
- The bot under `src/bot/` keeps its own copy of the spawn tables (it's a standalone offline tool); sync manually if you tune the bot.

## [0.4.9] - 2026-05-21

### Changed
- **Small** board now starts with **2** tiles instead of 3. With only 7 cells, the extra empty cell at start gives meaningfully more room to set up the first merge. Normal still starts with 3.

### Docs
- README spawn-rules table updated to reflect Small's new 2-tile starter.

## [0.4.8] - 2026-05-21

### Changed
- **Small** board no longer spawns `4` tiles — only `2`s. The board is space-limited, so a stray high-value tile was pure friction. Normal is unchanged (still 20% `4` per spawn).

### Docs
- README "Features" line updated to call out the two visible board sizes (Small / Normal).
- Added a **Spawn rules** table to the README documenting starter spawn, per-turn spawn count, and tile-value mix for Small and Normal.

## [0.4.7] - 2026-05-21

### Added
- Last chosen board size is now persisted to `localStorage` under `lastRadius` as soon as a new game is started, so refreshing before making the first move keeps the selected size (e.g. Small) instead of falling back to the default.

### Changed
- Saved-game writes are now gated on at least one move being made (non-empty `historyTileSet`), so a brand-new game with no moves no longer creates a stale save slot.

## [0.4.6] - 2026-05-21

### Added
- Game progress now persists across page reloads: board, tiles, score, current radius, and undo state (history snapshot, remaining undos, max-undo flag) are written to `localStorage` under the `savedGame` key after each change and restored on next visit. The saved game is cleared on game over or when starting a new game.

## [0.4.5] - 2026-05-21

### Changed
- New Game menu now offers only **Small** and **Normal** board sizes (Large and XL are hidden but preserved in code for easy restore).
- Renamed the radius-2 board from "Medium" to **"Normal"** across the New Game menu and the leaderboard.
- Default board size on first load is now **Normal** (radius 2) instead of Small.
- Leaderboard now lists the **top 5** per board (was top 3) and shows **Normal first**, Small second. Firestore listeners fetch 5 docs accordingly.
- "Beats high score" indicator now compares against the 5th-place entry (was 3rd) to match the new leaderboard depth.

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
