# GameContainer Component

This is the Game Container component, This component renders the grid and the game Tiles

## Properties

| Property             | Type       | Default    | Description                                                    |
| :------------------- | ---------- | :--------- | :------------------------------------------------------------- |
| **tileSet**          | `[]`       | `required` | Set of Tiles.                                                  |
| **resetGameHandler** | `function` | `() => {}` | Handler that will be fire after pressing the Try again button. |
| **isGameOver**       | `boolean`  | `required` | Boolean that indicates if the game is over.                    |
| **showCoords**       | `boolean`  | `false`    | Boolea that indicates if the grid coordinates should be shown. |
