# GameStatus Component

This is the Game Status component. It will render a text to the user with the current status of the game.

A `false` `gameOver` means that there are still valid movements to be played
A `true` `gameOver` means that the game has ran out of legal movements

## Properties

| Property     | Type      | Default    | Description         |
| :----------- | --------- | :--------- | :------------------ |
| **gameOver** | `boolean` | `required` | Status of the game. |
