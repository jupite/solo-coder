export class BalancePhysics {
    constructor() {
        this.gravity = 9.8;
        this.pendulumLength = 1.5;
        this.fallThreshold = Math.PI / 2.5;
        this.damping = 0.98;
    }

    update(player, deltaTime) {
        if (player.getIsFalling()) return;

        const tiltAngle = player.getTiltAngle();
        const angularVelocity = player.angularVelocity;

        const gravityTorque = -(this.gravity / this.pendulumLength) * Math.sin(tiltAngle);

        const newAngularVelocity = (angularVelocity + gravityTorque * deltaTime) * this.damping;

        player.angularVelocity = newAngularVelocity;
    }

    checkFall(player) {
        if (player.getIsFalling()) return false;

        const tiltAngle = Math.abs(player.getTiltAngle());
        return tiltAngle >= this.fallThreshold;
    }

    checkWin(player, wireLength) {
        return player.getPosition() >= wireLength - 1;
    }

    getBalancePercentage(player) {
        const tiltAngle = player.getTiltAngle();
        const maxAngle = player.getMaxTiltAngle();
        const percentage = (tiltAngle / maxAngle + 1) / 2;
        return Math.max(0, Math.min(1, percentage));
    }

    getFallThreshold() {
        return this.fallThreshold;
    }
}
