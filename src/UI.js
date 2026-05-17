class UI {
    constructor() {
        this.fishCountElement = document.getElementById('fish-count');
        this.tensionContainer = document.getElementById('tension-container');
        this.tensionFill = document.getElementById('tension-fill');
        this.messageElement = document.getElementById('message');
        this.resultPopup = document.getElementById('result-popup');
        
        this.fishCount = 0;
        this.tension = 0;
    }

    updateFishCount(count) {
        this.fishCount = count;
        this.fishCountElement.textContent = count;
    }

    showTensionBar() {
        this.tensionContainer.classList.add('visible');
    }

    hideTensionBar() {
        this.tensionContainer.classList.remove('visible');
    }

    setTension(value) {
        this.tension = Math.max(0, Math.min(100, value));
        this.tensionFill.style.width = `${this.tension}%`;
    }

    showMessage(text, duration = 0) {
        this.messageElement.textContent = text;
        this.messageElement.classList.add('visible');
        
        if (duration > 0) {
            setTimeout(() => {
                this.hideMessage();
            }, duration);
        }
    }

    hideMessage() {
        this.messageElement.classList.remove('visible');
    }

    showResult(success, text) {
        this.resultPopup.textContent = text;
        this.resultPopup.className = '';
        this.resultPopup.classList.add('visible', success ? 'success' : 'fail');
        
        setTimeout(() => {
            this.hideResult();
        }, 2000);
    }

    hideResult() {
        this.resultPopup.classList.remove('visible', 'success', 'fail');
    }

    reset() {
        this.hideTensionBar();
        this.setTension(0);
        this.hideMessage();
    }
}

export default UI;
