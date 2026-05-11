import { useState } from 'react'
import Game from './components/Game'

function App() {
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleGameOver = (finalScore) => {
    setScore(finalScore)
    setGameOver(true)
  }

  const handleStartGame = () => {
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
  }

  const handleRestart = () => {
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="app">
      {!isPlaying && !gameOver && (
        <div className="start-screen">
          <h1>🏗️ 搭积木游戏</h1>
          <p className="subtitle">在安全区外放置积木，建造最高的塔！</p>
          <div className="instructions">
            <h3>游戏规则：</h3>
            <ul>
              <li>点击鼠标放置积木</li>
              <li>只能在安全区外放置</li>
              <li>积木会受到重力影响</li>
              <li>如果积木倒塌，游戏结束</li>
            </ul>
          </div>
          <button className="start-btn" onClick={handleStartGame}>
            开始游戏
          </button>
        </div>
      )}
      
      {isPlaying && <Game onGameOver={handleGameOver} />}
      
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>游戏结束!</h2>
            <p className="final-score">最终得分: {score}</p>
            <button className="restart-btn" onClick={handleRestart}>
              重新开始
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .app {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .start-screen {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
          z-index: 100;
        }
        
        .start-screen h1 {
          font-size: 4rem;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        
        .subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0.8;
        }
        
        .instructions {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          text-align: left;
        }
        
        .instructions h3 {
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }
        
        .instructions ul {
          list-style: none;
          font-size: 1.1rem;
          line-height: 2;
        }
        
        .instructions li::before {
          content: '✓';
          color: #4ade80;
          margin-right: 0.5rem;
        }
        
        .start-btn, .restart-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 1rem 4rem;
          font-size: 1.3rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        
        .start-btn:hover, .restart-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }
        
        .game-over-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .game-over-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          color: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .game-over-modal h2 {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }
        
        .final-score {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #fbbf24;
        }
        
        .restart-btn {
          padding: 1rem 3rem;
        }
      `}</style>
    </div>
  )
}

export default App
