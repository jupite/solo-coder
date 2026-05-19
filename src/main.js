import { Game } from './game/Game.js'

const container = document.getElementById('game-container')

let game = null

function initGame() {
  game = new Game(container)
}

window.addEventListener('DOMContentLoaded', initGame)

window.addEventListener('beforeunload', () => {
  if (game) {
    game.dispose()
  }
})
