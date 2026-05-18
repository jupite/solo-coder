export class GameLoop {
    constructor(callback) {
        this.callback = callback;
        this.animationId = null;
        this.isRunning = false;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.tick();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    tick() {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.tick());
        this.callback();
    }
}
