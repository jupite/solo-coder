export class BalancePhysics {
    constructor() {
        this.gravity = 9.8;
        this.pendulumLength = 1.2;
        this.fallThreshold = Math.PI / 3;
        this.damping = 0.92;
        this.momentOfInertia = 1;
    }

    update(player, deltaTime) {
        if (player.getIsFalling()) return;

        const tiltAngle = player.getTiltAngle();
        const angularVelocity = player.angularVelocity;

        const gravityTorque = -(this.gravity / this.pendulumLength) * Math.sin(tiltAngle) * this.momentOfInertia;

        const inputTorque = player.getInputTorque();
        const windTorque = player.getWindTorque();

        const totalTorque = gravityTorque + inputTorque + windTorque;

        const angularAcceleration = totalTorque / this.momentOfInertia;

        let newAngularVelocity = angularVelocity + angularAcceleration * deltaTime;
        newAngularVelocity *= this.damping;

        let newTiltAngle = tiltAngle + newAngularVelocity * deltaTime;

        player.setTiltAngle(newTiltAngle);
        player.setAngularVelocity(newAngularVelocity);

        player.inputTorque = 0;
        player.windTorque = 0;
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
