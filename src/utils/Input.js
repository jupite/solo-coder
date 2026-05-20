export class Input {
    constructor() {
        this.keys = {
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
        };
        this.keyPressed = {};
        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        const key = e.code;
        if (this.keys.hasOwnProperty(key)) {
            e.preventDefault();
            if (!this.keys[key]) {
                this.keyPressed[key] = true;
            }
            this.keys[key] = true;
        }
    }

    onKeyUp(e) {
        const key = e.code;
        if (this.keys.hasOwnProperty(key)) {
            e.preventDefault();
            this.keys[key] = false;
        }
    }

    isDown(key) {
        return this.keys[key] || false;
    }

    wasPressed(key) {
        if (this.keyPressed[key]) {
            this.keyPressed[key] = false;
            return true;
        }
        return false;
    }

    clearPressed() {
        for (const key in this.keyPressed) {
            this.keyPressed[key] = false;
        }
    }

    isCrouching() {
        return this.isDown('ArrowDown');
    }

    isMovingLeft() {
        return this.wasPressed('ArrowLeft');
    }

    isMovingRight() {
        return this.wasPressed('ArrowRight');
    }

    isJumping() {
        return this.wasPressed('Space');
    }
}
