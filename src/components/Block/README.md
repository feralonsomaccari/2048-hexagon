# Block Component

This is the Block component. Each block is an piece of the game grid. In the future this component could be scalated to render other shapes than only Hexagonal shapes.

Doc: https://www.redblobgames.com/grids/hexagons/#coordinates-cube

## Properties

| Property  | Type     | Default    | Description                   |
| :-------- | -------- | :--------- | :---------------------------- |
| **x**     | `number` | `required` | x position of the Element.    |
| **y**     | `number` | `required` | y position of the Element.    |
| **z**     | `number` | `required` | z position of the Element.    |
| **value** | `number` | `0`        | Value of the Element.         |
| **style** | `object` | `{}`       | inline styles of the Element. |
