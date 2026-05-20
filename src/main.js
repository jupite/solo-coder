import { GameScene } from './scene.js';
import { Player } from './player.js';
import { BalancePhysics } from './physics.js';
import { WindSystem } from './wind.js';
import { Controls } from './controls.js';
import { FollowCamera } from './camera.js';
import { UIManager } from './ui.js';

class Game {
    constructor() {
        this.container = document.getElementById('game-container');

        this.gameScene = new GameScene(this.container);
        this.player = new Player(this.gameScene.getWireHeight());
        this.physics = new BalancePhysics();
        this.wind = new WindSystem();
        this.controls = new Controls();
        this.followCamera = new FollowCamera();
        this.ui = new UIManager();

        this.gameScene.scene.add(this.player.getGroup());

        this.isRunning = false;
        this.isGameOver = false;
        this.clock = new THREE.Clock();

        this.wireLength = this.gameScene.getWireLength();
        this.ui.setTargetDistance(this.wireLength);

        this.ui.onStart(() => this.startGame());
        this.ui.onRestart(() => this.restartGame());

        this.ui.showStartScreen();
        this.followCamera.reset(this.player.getGroup());

        this.animate = this.animate.bind(this);
        this.animate();
    }

    startGame() {
        this.isRunning = true;
        this.isGameOver = false;
        this.ui.hideStartScreen();
        this.ui.hideGameOverScreen();
        this.controls.setEnabled(true);
        this.clock.start();
    }

    restartGame() {
        this.player.reset();
        this.wind.reset();
        this.controls.reset();
        this.ui.reset(this.player.getPosition(), this.wireLength);
        this.followCamera.reset(this.player.getGroup());

        this.isRunning = true;
        this.isGameOver = false;
        this.ui.hideGameOverScreen();
        this.clock.start();
    }

    update(deltaTime) {
        if (!this.isRunning || this.isGameOver) return;

        const tiltInput = this.controls.getTiltInput();

        this.wind.update(deltaTime);

        this.player.applyWindEffect(this.wind.getWindForce(), deltaTime);

        this.player.update(deltaTime, tiltInput);

        this.physics.update(this.player, deltaTime);

        if (this.physics.checkFall(this.player)) {
            this.player.startFalling();
            this.gameOver(false);
            return;
        }

        if (this.physics.checkWin(this.player, this.wireLength)) {
            this.gameOver(true);
            return;
        }

        this.ui.updateDistance(this.player.getPosition(), this.wireLength);
        this.ui.updateWind(this.wind);
        this.ui.updateBalance(this.physics.getBalancePercentage(this.player));

        this.followCamera.update(this.player.getGroup(), deltaTime);
    }

    gameOver(isWin) {
        this.isGameOver = true;
        this.isRunning = false;
        this.controls.setEnabled(false);

        setTimeout(() => {
            this.ui.showGameOver(isWin, this.player.getPosition());
        }, 1500);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        this.update(deltaTime);

        this.gameScene.render(this.followCamera.getCamera());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
