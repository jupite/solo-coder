import SceneManager from './SceneManager.js';
import Environment from './Environment.js';
import Buoy from './Buoy.js';
import Fish from './Fish.js';
import GameLogic from './GameLogic.js';
import UI from './UI.js';

class FishingGame {
    constructor() {
        this.sceneManager = new SceneManager('game-container');
        this.environment = new Environment(this.sceneManager.getScene());
        this.buoy = new Buoy(this.sceneManager.getScene());
        this.fish = new Fish(this.sceneManager.getScene());
        this.ui = new UI();
        this.gameLogic = new GameLogic(
            this.sceneManager,
            this.environment,
            this.buoy,
            this.fish,
            this.ui
        );
        
        this.elapsedTime = 0;
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        const deltaTime = this.sceneManager.getDelta();
        this.elapsedTime += deltaTime;
        
        this.environment.update(deltaTime, this.elapsedTime);
        this.gameLogic.update(deltaTime, this.elapsedTime);
        
        this.sceneManager.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new FishingGame();
});
