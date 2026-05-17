export class GameUI {
  constructor(container) {
    this.container = container;
    
    this.createButtons();
    this.createMessageDiv();
  }

  createButtons() {
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.style.cssText = `
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
    `;
    this.container.appendChild(this.buttonContainer);

    this.resetPinsButton = document.createElement('button');
    this.resetPinsButton.textContent = '重置球瓶';
    this.resetPinsButton.style.cssText = `
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
      transition: all 0.3s ease;
    `;
    this.resetPinsButton.addEventListener('click', () => {
      this.onResetPins?.();
    });
    this.resetPinsButton.addEventListener('mouseenter', () => {
      this.resetPinsButton.style.transform = 'scale(1.05)';
    });
    this.resetPinsButton.addEventListener('mouseleave', () => {
      this.resetPinsButton.style.transform = 'scale(1)';
    });
    this.buttonContainer.appendChild(this.resetPinsButton);

    this.resetGameButton = document.createElement('button');
    this.resetGameButton.textContent = '重新开始';
    this.resetGameButton.style.cssText = `
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      background: linear-gradient(135deg, #f44336, #da190b);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
      transition: all 0.3s ease;
    `;
    this.resetGameButton.addEventListener('click', () => {
      this.onResetGame?.();
    });
    this.resetGameButton.addEventListener('mouseenter', () => {
      this.resetGameButton.style.transform = 'scale(1.05)';
    });
    this.resetGameButton.addEventListener('mouseleave', () => {
      this.resetGameButton.style.transform = 'scale(1)';
    });
    this.buttonContainer.appendChild(this.resetGameButton);
  }

  createMessageDiv() {
    this.messageDiv = document.createElement('div');
    this.messageDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      padding: 30px 50px;
      border-radius: 15px;
      color: white;
      font-size: 28px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
      display: none;
      z-index: 100;
    `;
    this.container.appendChild(this.messageDiv);
  }

  showMessage(text, color = '#FFFFFF') {
    this.messageDiv.textContent = text;
    this.messageDiv.style.color = color;
    this.messageDiv.style.display = 'block';
    
    setTimeout(() => {
      this.hideMessage();
    }, 3000);
  }

  hideMessage() {
    this.messageDiv.style.display = 'none';
  }

  setOnResetPins(callback) {
    this.onResetPins = callback;
  }

  setOnResetGame(callback) {
    this.onResetGame = callback;
  }

  enableResetPins(enabled) {
    this.resetPinsButton.disabled = !enabled;
    this.resetPinsButton.style.opacity = enabled ? 1 : 0.5;
  }

  dispose() {
    if (this.buttonContainer && this.container) {
      this.container.removeChild(this.buttonContainer);
    }
    if (this.messageDiv && this.container) {
      this.container.removeChild(this.messageDiv);
    }
  }
}
