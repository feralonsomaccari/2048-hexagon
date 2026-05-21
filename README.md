# 2048 Hexagon

This is a hexagonal version of the classic [2048](https://play2048.co/).

**[Play it here →](https://2048hexagon.com)**

![Gameplay](./game2.png)

### Spawn rules

Because this is not a square like the regular one I've been tweaking the game to make it winnable and as fair as possible. For example the small hexagon version
most likely cannot be beaten, so I reduce the win condition to 512.

| Board  | Cells | Starter spawn | Per-turn spawn count                  | Spawned tile values |
| ------ | ----- | ------------- | ------------------------------------- | ------------------- |
| Small  | 7     | 2 × `2`       | 1 tile                                | 100% `2` · 0% `4`   |
| Normal | 19    | 3 × `2`       | 50% chance of 1 tile · 50% of 2 tiles | 80% `2` · 20% `4`   |

Small never spawns a `4` — board pressure already comes from running out of space, so a stray high-value tile would be pure friction. Normal can spawn 4s and occasionally adds two tiles at once to keep the larger board filling up.

Was quite a challenge to make the hexagons to work. I've used this guide to learn how to do it [Red Blob Games](https://www.redblobgames.com/grids/hexagons/)

## Tech stack

- **React 18** + **TypeScript**
- **Vite**
- **CSS Modules** for scoped styling
- **Firebase Firestore** for the leaderboard
- Deployed to **GitHub Pages** via `gh-pages`

## Local development

Requires Node ≥ 20.19 and npm ≥ 9.

```bash
npm i
npm run dev
npm run test:watch # run tests in watch mode
```

## Credits

- Based on the original **[2048](https://play2048.co/)** by [Gabriele Cirulli](https://github.com/gabrielecirulli).
- Hex coordinate math adapted from [Red Blob Games](https://www.redblobgames.com/grids/hexagons/).
