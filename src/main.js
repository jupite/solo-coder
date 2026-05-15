import { Game } from './game/Game.js'

const game = new Game()
game.init()

document.getElementById('restart-btn').addEventListener('click', () => {
  game.restart()
})