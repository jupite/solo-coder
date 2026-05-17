import { GameState, MoveDirection } from '../game/types.js';
import { GameConfig } from '../game/GameConfig.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.init();
  }

  init() {
    this.elements.hud = document.createElement('div');
    this.elements.hud.className = 'hud';
    this.elements.hud.innerHTML = `
      <div class="hud-left">
        <div class="stat-item">
          <span class="stat-label">层数</span>
          <span class="stat-value" id="layerCount">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">得分</span>
          <span class="stat-value" id="scoreCount">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">连胜</span>
          <span class="stat-value" id="streakCount">0</span>
        </div>
      </div>
      <div class="hud-right">
        <div class="direction-indicator">
          <span class="stat-label">下次方向</span>
          <div class="direction-arrow" id="directionArrow">→</div>
        </div>
      </div>
    `;

    this.elements.startScreen = document.createElement('div');
    this.elements.startScreen.className = 'overlay';
    this.elements.startScreen.innerHTML = `
      <div class="overlay-content">
        <h1>Tower Bloxx 3D</h1>
        <p class="subtitle">堆叠方块，建造通天塔！</p>
        <div class="instructions">
          <p>🎮 按 <kbd>空格键</kbd> 下落方块</p>
          <p>🎯 连续完美堆叠5次即可获胜</p>
          <p>❌ 方块完全偏移则游戏结束</p>
        </div>
        <button class="btn-primary" id="startBtn">开始游戏</button>
      </div>
    `;

    this.elements.winScreen = document.createElement('div');
    this.elements.winScreen.className = 'overlay overlay-win';
    this.elements.winScreen.innerHTML = `
      <div class="overlay-content">
        <h1>🎉 恭喜胜利！</h1>
        <p class="subtitle">你成功连续完美堆叠5次！</p>
        <div class="stats-final">
          <div class="stat-final">
            <span class="stat-label">最终层数</span>
            <span class="stat-value" id="finalLayer">0</span>
          </div>
          <div class="stat-final">
            <span class="stat-label">最终得分</span>
            <span class="stat-value" id="finalScore">0</span>
          </div>
        </div>
        <button class="btn-primary" id="restartWinBtn">再来一局</button>
      </div>
    `;

    this.elements.gameOverScreen = document.createElement('div');
    this.elements.gameOverScreen.className = 'overlay overlay-gameover';
    this.elements.gameOverScreen.innerHTML = `
      <div class="overlay-content">
        <h1>💥 游戏结束</h1>
        <p class="subtitle">方块完全偏移了...</p>
        <div class="stats-final">
          <div class="stat-final">
            <span class="stat-label">最终层数</span>
            <span class="stat-value" id="gameOverLayer">0</span>
          </div>
          <div class="stat-final">
            <span class="stat-label">最终得分</span>
            <span class="stat-value" id="gameOverScore">0</span>
          </div>
        </div>
        <button class="btn-primary" id="restartBtn">重新开始</button>
      </div>
    `;

    this.elements.message = document.createElement('div');
    this.elements.message.className = 'floating-message';
    this.elements.message.id = 'floatingMessage';

    document.body.appendChild(this.elements.hud);
    document.body.appendChild(this.elements.startScreen);
    document.body.appendChild(this.elements.winScreen);
    document.body.appendChild(this.elements.gameOverScreen);
    document.body.appendChild(this.elements.message);

    this.hideAllOverlays();
    this.showStartScreen();
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        overflow: hidden;
        background: #1a1a2e;
      }

      #game-container {
        width: 100vw;
        height: 100vh;
      }

      .hud {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        z-index: 100;
      }

      .hud-left, .hud-right {
        display: flex;
        gap: 20px;
      }

      .stat-item {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
      }

      .stat-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .direction-indicator {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .direction-arrow {
        font-size: 32px;
        color: #ffd700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        animation: pulse 1s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 200;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .overlay.hidden {
        display: none;
      }

      .overlay-content {
        text-align: center;
        color: white;
        max-width: 500px;
        padding: 40px;
      }

      .overlay-content h1 {
        font-size: 48px;
        margin-bottom: 10px;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .overlay-win h1 {
        color: #48bb78;
      }

      .overlay-gameover h1 {
        color: #f56565;
      }

      .subtitle {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 30px;
      }

      .instructions {
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 30px;
        text-align: left;
      }

      .instructions p {
        margin: 10px 0;
        font-size: 16px;
      }

      kbd {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 12px;
        border-radius: 6px;
        font-family: monospace;
        font-weight: bold;
      }

      .stats-final {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin-bottom: 30px;
      }

      .stat-final {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-final .stat-value {
        font-size: 48px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 16px 48px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      .floating-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: bold;
        color: #ffd700;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
        pointer-events: none;
        opacity: 0;
        z-index: 150;
        transition: opacity 0.3s ease;
      }

      .floating-message.show {
        animation: floatUp 1s ease-out forwards;
      }

      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
          opacity: 1;
          transform: translate(-50%, -80%) scale(1.2);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -120%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  updateLayer(layer) {
    document.getElementById('layerCount').textContent = layer;
  }

  updateScore(score) {
    document.getElementById('scoreCount').textContent = score;
  }

  updateStreak(streak) {
    document.getElementById('streakCount').textContent = streak;
  }

  updateDirection(direction) {
    const arrowEl = document.getElementById('directionArrow');
    arrowEl.textContent = direction === MoveDirection.X ? '↔' : '↕';
  }

  showStartScreen() {
    this.hideAllOverlays();
    this.elements.startScreen.classList.remove('hidden');
  }

  showWinScreen(layer, score) {
    document.getElementById('finalLayer').textContent = layer;
    document.getElementById('finalScore').textContent = score;
    this.hideAllOverlays();
    this.elements.winScreen.classList.remove('hidden');
  }

  showGameOverScreen(layer, score) {
    document.getElementById('gameOverLayer').textContent = layer;
    document.getElementById('gameOverScore').textContent = score;
    this.hideAllOverlays();
    this.elements.gameOverScreen.classList.remove('hidden');
  }

  hideAllOverlays() {
    this.elements.startScreen.classList.add('hidden');
    this.elements.winScreen.classList.add('hidden');
    this.elements.gameOverScreen.classList.add('hidden');
  }

  showMessage(text) {
    const msgEl = document.getElementById('floatingMessage');
    msgEl.textContent = text;
    msgEl.classList.remove('show');
    void msgEl.offsetWidth;
    msgEl.classList.add('show');
  }

  onStart(callback) {
    document.getElementById('startBtn').addEventListener('click', callback);
  }

  onRestart(callback) {
    document.getElementById('restartBtn').addEventListener('click', callback);
    document.getElementById('restartWinBtn').addEventListener('click', callback);
  }

  dispose() {
    document.body.removeChild(this.elements.hud);
    document.body.removeChild(this.elements.startScreen);
    document.body.removeChild(this.elements.winScreen);
    document.body.removeChild(this.elements.gameOverScreen);
    document.body.removeChild(this.elements.message);
  }
}
