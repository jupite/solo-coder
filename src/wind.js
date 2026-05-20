export class WindSystem {
    constructor() {
        this.currentWind = 0;
        this.targetWind = 0;
        this.maxWind = 3.5;
        this.changeInterval = 3;
        this.timeSinceChange = 0;
        this.smoothing = 0.02;
    }

    reset() {
        this.currentWind = 0;
        this.targetWind = 0;
        this.timeSinceChange = 0;
    }

    update(deltaTime) {
        this.timeSinceChange += deltaTime;

        if (this.timeSinceChange >= this.changeInterval) {
            this.timeSinceChange = 0;
            this.targetWind = (Math.random() - 0.5) * 2 * this.maxWind;
            this.changeInterval = 2 + Math.random() * 4;
        }

        this.currentWind += (this.targetWind - this.currentWind) * this.smoothing;
    }

    getWindForce() {
        return this.currentWind;
    }

    getWindDirection() {
        if (Math.abs(this.currentWind) < 0.1) return 0;
        return this.currentWind > 0 ? 1 : -1;
    }

    getWindStrength() {
        return Math.abs(this.currentWind);
    }

    getWindPercentage() {
        return (this.currentWind / this.maxWind + 1) / 2;
    }
}
