export class Controls {
    constructor() {
        this.keys = {
            left: false,
            right: false
        };

        this.enabled = true;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(event) {
        if (!this.enabled) return;

        switch (event.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    }

    getTiltInput() {
        if (!this.enabled) return 0;

        let input = 0;
        if (this.keys.left) input -= 1;
        if (this.keys.right) input += 1;
        return input;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.keys.left = false;
            this.keys.right = false;
        }
    }

    reset() {
        this.keys.left = false;
        this.keys.right = false;
        this.enabled = true;
    }

    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
