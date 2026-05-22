export class InputController {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onKeyDown(e) {
        switch(e.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
        }
    }
    
    onKeyUp(e) {
        switch(e.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
        }
    }
    
    getSteering() {
        let steering = 0;
        if (this.keys.left) steering -= 1;
        if (this.keys.right) steering += 1;
        return steering;
    }
    
    getThrottle() {
        let throttle = 0;
        if (this.keys.forward) throttle += 1;
        if (this.keys.backward) throttle -= 0.5;
        return throttle;
    }
}
