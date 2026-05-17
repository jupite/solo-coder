import * as THREE from 'three';

class GameLogic {
    constructor(sceneManager, environment, buoy, fish, ui) {
        this.sceneManager = sceneManager;
        this.environment = environment;
        this.buoy = buoy;
        this.fish = fish;
        this.ui = ui;
        
        this.gameState = 'idle';
        this.fishCount = 0;
        this.waitTime = 0;
        this.hookedTime = 0;
        this.tension = 0;
        this.tensionDecayRate = 30;
        this.tensionGainRate = 120;
        this.reelDuration = 1.5;
        this.elapsedTime = 0;
        this.spacePressed = false;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const renderer = this.sceneManager.getRenderer();
        
        renderer.domElement.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                this.spacePressed = true;
                this.handleSpacePress();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                this.spacePressed = false;
            }
        });
    }

    handleClick(event) {
        if (this.gameState !== 'idle') return;
        
        const rect = this.sceneManager.getRenderer().domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.getCamera());
        
        const water = this.environment.getWater();
        const intersects = this.raycaster.intersectObject(water);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const distance = Math.sqrt(point.x * point.x + point.z * point.z);
            const pondRadius = this.environment.getPondRadius();
            
            if (distance < pondRadius - 1) {
                this.castRod(point);
            }
        }
    }

    castRod(position) {
        this.buoy.castTo(position);
        this.gameState = 'waiting';
        this.waitTime = 3 + Math.random() * 7;
        this.ui.showMessage('等待鱼儿上钩...');
    }

    handleSpacePress() {
        if (this.gameState === 'reeling') {
            this.tension += this.tensionGainRate * 0.016;
            this.ui.setTension(this.tension);
        }
    }

    fishHooked() {
        this.gameState = 'hooked';
        this.buoy.startSinking();
        this.fish.spawn(this.buoy.getPosition());
        this.ui.showMessage('有鱼上钩了！快速按空格键收线！');
        
        setTimeout(() => {
            if (this.gameState === 'hooked') {
                this.startReeling();
            }
        }, 1000);
    }

    startReeling() {
        this.gameState = 'reeling';
        this.hookedTime = 0;
        this.tension = 0;
        this.ui.showTensionBar();
        this.ui.setTension(0);
        this.ui.hideMessage();
    }

    fishingSuccess() {
        this.gameState = 'success';
        this.fishCount++;
        this.ui.updateFishCount(this.fishCount);
        this.ui.hideTensionBar();
        this.ui.showResult(true, `钓到鱼了！共 ${this.fishCount} 条`);
        
        this.fish.jumpTo(new THREE.Vector3(0, 5, 5));
        
        setTimeout(() => {
            this.resetGame();
        }, 2500);
    }

    fishingFailed() {
        this.gameState = 'failed';
        this.ui.hideTensionBar();
        this.ui.showResult(false, '鱼跑了！');
        
        this.fish.escape();
        
        setTimeout(() => {
            this.resetGame();
        }, 2000);
    }

    resetGame() {
        this.buoy.reset();
        this.fish.reset();
        this.ui.reset();
        this.gameState = 'idle';
        this.tension = 0;
        this.hookedTime = 0;
        this.waitTime = 0;
    }

    update(deltaTime, elapsedTime) {
        this.elapsedTime = elapsedTime;
        
        if (this.gameState === 'waiting') {
            this.waitTime -= deltaTime;
            if (this.waitTime <= 0) {
                this.fishHooked();
            }
        }
        
        if (this.gameState === 'reeling') {
            this.hookedTime += deltaTime;
            
            if (this.spacePressed) {
                this.tension += this.tensionGainRate * deltaTime;
            } else {
                this.tension -= this.tensionDecayRate * deltaTime;
            }
            
            this.tension = Math.max(0, Math.min(100, this.tension));
            this.ui.setTension(this.tension);
            
            if (this.tension >= 100) {
                this.fishingSuccess();
            } else if (this.hookedTime >= this.reelDuration) {
                this.fishingFailed();
            }
        }
        
        this.buoy.update(deltaTime, elapsedTime);
        this.fish.update(deltaTime, elapsedTime);
    }

    getState() {
        return this.gameState;
    }
}

export default GameLogic;
