import { INPUT_KEYS } from '../utils/constants.js';

export class InputManager {
    constructor() {
        this.keys = {};
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    isLeftPressed() {
        return INPUT_KEYS.LEFT.some(key => this.keys[key]);
    }
    
    isRightPressed() {
        return INPUT_KEYS.RIGHT.some(key => this.keys[key]);
    }
    
    getHorizontalAxis() {
        let axis = 0;
        if (this.isLeftPressed()) axis -= 1;
        if (this.isRightPressed()) axis += 1;
        return axis;
    }
}
