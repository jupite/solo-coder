import { useState, useEffect, useCallback } from 'react'
import GameRenderer from './GameRenderer'
import { createGameState, movePlayer, levels } from './gameLogic'
import './App.css'

function App() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameState, setGameState] = useState(() => createGameState(0))

  const handleKeyDown = useCallback(
    (e) => {
      if (gameState.isWin) return

      let dx = 0
      let dy = 0

      switch (e.key) {
        case 'ArrowUp':
          dy = -1
          break
        case 'ArrowDown':
          dy = 1
          break
        case 'ArrowLeft':
          dx = -1
          break
        case 'ArrowRight':
          dx = 1
          break
        default:
          return
      }

      e.preventDefault()
      setGameState((prev) => movePlayer(prev, dx, dy))
    },
    [gameState.isWin]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const resetLevel = () => {
    setGameState(createGameState(currentLevel))
  }

  const nextLevel = () => {
    const next = (currentLevel + 1) % levels.length
    setCurrentLevel(next)
    setGameState(createGameState(next))
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>🎮 推箱子游戏</h1>
        <h2>{gameState.levelName} ({currentLevel + 1}/{levels.length})</h2>
      </header>

      <div className="game-main">
        <GameRenderer gameState={gameState} />

        {gameState.isWin && (
          <div className="win-overlay">
            <div className="win-content">
              <h2>🎉 恭喜通关！</h2>
              <p>你已成功将箱子推到目标点</p>
              <button className="game-btn next-btn" onClick={nextLevel}>
                下一关 ➡️
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls-panel">
        <p className="instructions">
          使用键盘方向键 ⬆️⬇️⬅️➡️ 移动玩家，将 📦 推到 🎯 目标点上
        </p>
        <div className="buttons-row">
          <button className="game-btn reset-btn" onClick={resetLevel}>
            🔄 重置关卡
          </button>
          <button className="game-btn level-btn" onClick={nextLevel}>
            ⏭️ 切换关卡
          </button>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color wall"></span>
          <span>墙壁 🧱</span>
        </div>
        <div className="legend-item">
          <span className="legend-color floor"></span>
          <span>地板</span>
        </div>
        <div className="legend-item">
          <span className="legend-color target"></span>
          <span>目标点 🎯</span>
        </div>
        <div className="legend-item">
          <span className="legend-color player"></span>
          <span>玩家 🧑</span>
        </div>
        <div className="legend-item">
          <span className="legend-color box"></span>
          <span>箱子 📦</span>
        </div>
      </div>
    </div>
  )
}

export default App
