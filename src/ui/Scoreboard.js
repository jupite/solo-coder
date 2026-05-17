export class Scoreboard {
  constructor(container) {
    this.container = container;
    this.currentFrame = 1;
    this.maxFrames = 10;
    this.scores = [];
    this.totalScore = 0;
    
    this.createElements();
  }

  createElements() {
    this.scoreboardDiv = document.createElement('div');
    this.scoreboardDiv.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 12px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
      min-width: 200px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    this.container.appendChild(this.scoreboardDiv);

    this.frameInfo = document.createElement('div');
    this.frameInfo.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      text-align: center;
      color: #FFD700;
    `;
    this.scoreboardDiv.appendChild(this.frameInfo);

    this.frameScoresDiv = document.createElement('div');
    this.frameScoresDiv.style.cssText = `
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 5px;
      margin-bottom: 15px;
    `;
    this.scoreboardDiv.appendChild(this.frameScoresDiv);

    this.totalScoreDiv = document.createElement('div');
    this.totalScoreDiv.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      color: #00FF00;
    `;
    this.scoreboardDiv.appendChild(this.totalScoreDiv);

    this.update();
  }

  addScore(knockedDown, isStrike = false, isSpare = false) {
    if (this.currentFrame > this.maxFrames) return;

    const frameScore = {
      knockedDown,
      isStrike,
      isSpare,
      score: knockedDown
    };
    
    this.scores.push(frameScore);
    this.update();
  }

  nextFrame() {
    if (this.currentFrame < this.maxFrames) {
      this.currentFrame++;
    }
    this.update();
  }

  calculateTotalScore() {
    let total = 0;
    
    for (let i = 0; i < this.scores.length; i++) {
      const frame = this.scores[i];
      
      if (frame.isStrike) {
        total += 10;
        if (i + 1 < this.scores.length) {
          total += this.scores[i + 1].knockedDown;
          if (this.scores[i + 1].isStrike && i + 2 < this.scores.length) {
            total += this.scores[i + 2].knockedDown;
          }
        }
      } else if (frame.isSpare) {
        total += 10;
        if (i + 1 < this.scores.length) {
          total += this.scores[i + 1].knockedDown;
        }
      } else {
        total += frame.score;
      }
    }
    
    this.totalScore = total;
    return total;
  }

  update() {
    this.frameInfo.textContent = `\u7B2C ${this.currentFrame} / ${this.maxFrames} 局`;
    
    this.frameScoresDiv.innerHTML = '';
    
    for (let i = 0; i < this.maxFrames; i++) {
      const frameDiv = document.createElement('div');
      frameDiv.style.cssText = `
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      `;
      
      if (i < this.scores.length) {
        const frame = this.scores[i];
        if (frame.isStrike) {
          frameDiv.textContent = 'X';
          frameDiv.style.color = '#FFD700';
        } else if (frame.isSpare) {
          frameDiv.textContent = '/';
          frameDiv.style.color = '#00FFFF';
        } else {
          frameDiv.textContent = frame.knockedDown;
          frameDiv.style.color = '#FFFFFF';
        }
      }
      
      this.frameScoresDiv.appendChild(frameDiv);
    }
    
    this.calculateTotalScore();
    this.totalScoreDiv.textContent = `\u603B\u5206: ${this.totalScore}`;
  }

  reset() {
    this.currentFrame = 1;
    this.scores = [];
    this.totalScore = 0;
    this.update();
  }

  getCurrentFrame() {
    return this.currentFrame;
  }

  getTotalScore() {
    return this.totalScore;
  }

  isGameOver() {
    return this.currentFrame > this.maxFrames;
  }

  dispose() {
    if (this.scoreboardDiv && this.container) {
      this.container.removeChild(this.scoreboardDiv);
    }
  }
}
