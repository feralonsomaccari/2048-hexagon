# Hexagonal 2048

This is a [2048](https://play2048.co/) clone game on a Hexagonal field for the CodeScreen assessment at Evolution.
## Description
No external libraries have been used to make this game. For CSS I decided to go with CSS Modules for its simplicity since it doesn't require any set up. Although, I would have liked to have set it up to support BEM convention.

Features:
- Different game sizes (up to 6) you can choose the levels by pressing the button "New Game"
- Animations
- Styles based on original 2048 game
- A Score tracking system
- A Max Score tracking system
- Undo functionality
- Unit Tests

A history functionality using LocalStorage was also added (just like the real game) but, I had to delete it due to conflicts with the Puppeteer tests. The code is still there but commented out if you want to check it out.

I had a lot of fun with this project and definitely learned a lot from it; Specially about the hexagonal topic which was something new for me and made me want to dive into different concepts and algorithms. The [cube coordinates](https://www.redblobgames.com/grids/hexagons/#coordinates-cube) was a nice reading.

I hope you enjoy this solution of the hometask.
