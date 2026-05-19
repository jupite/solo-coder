class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        this.track = null;
        this.playerCar = null;
        this.aiCars = [];
        this.obstacleSystem = null;
        this.powerupSystem = null;
        this.collisionSystem = null;
        this.cameraSystem = null;
        this.ui = null;
        
        this.keys = {};
        this.raceState = 'countdown';
        this.countdownTime = CONFIG.RACE.COUNTDOWN_TIME;
        this.countdownTimer = 0;
        
        this.raceTime = 0;
        this.lapStartTime = 0;
        this.lastLapWaypoint = 0;
        this.lastLapProgress = 0;
        
        this.animFrameId = null;
        this.boundAnimate = null;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createTrack();
        this.createPlayer();
        this.createAI();
        this.createObstacles();
        this.createPowerups();
        this.createCollisionSystem();
        this.createCamera();
        this.createUI();
        this.setupEventListeners();
        this.startCountdown();
        this.boundAnimate = this.animate.bind(this);
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.COLORS.SKY);
        this.scene.fog = new THREE.Fog(CONFIG.COLORS.SKY, 200, 600);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        this.clock = new THREE.Clock();
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 150, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 800;
        directionalLight.shadow.camera.left = -400;
        directionalLight.shadow.camera.right = 400;
        directionalLight.shadow.camera.top = 400;
        directionalLight.shadow.camera.bottom = -400;
        this.scene.add(directionalLight);
        
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createTrack() {
        this.track = new Track(this.scene);
    }

    createPlayer() {
        this.playerCar = new Car(this.scene, CONFIG.COLORS.PLAYER_CAR, true);
        this.playerCar.setPosition(this.track.getStartPosition());
        this.playerCar.setRotation(this.track.getStartRotation());
    }

    createAI() {
        for (let i = 0; i < CONFIG.AI.COUNT; i++) {
            const ai = new AIController(this.scene, this.track, i);
            this.aiCars.push(ai);
        }
    }

    createObstacles() {
        this.obstacleSystem = new ObstacleSystem(this.scene, this.track);
    }

    createPowerups() {
        this.powerupSystem = new PowerupSystem(this.scene, this.track);
    }

    createCollisionSystem() {
        this.collisionSystem = new CollisionSystem();
    }

    createCamera() {
        this.cameraSystem = new CameraSystem(this.camera, this.playerCar);
        this.cameraSystem.reset();
    }

    createUI() {
        this.ui = new UISystem();
        this.ui.restartBtn.addEventListener('click', () => this.restartGame());
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    startCountdown() {
        this.raceState = 'countdown';
        this.countdownTime = CONFIG.RACE.COUNTDOWN_TIME;
        this.countdownTimer = 0;
        this.ui.showCountdown(this.countdownTime);
    }

    handleInput() {
        if (this.raceState !== 'racing') return;
        
        this.playerCar.steerInput = 0;
        this.playerCar.accelInput = 0;
        this.playerCar.brakeInput = 0;
        
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.playerCar.steerInput = -1;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.playerCar.steerInput = 1;
        }
        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerCar.accelInput = 1;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerCar.brakeInput = 1;
        }
    }

    updateCountdown(deltaTime) {
        this.countdownTimer += deltaTime;
        
        if (this.countdownTimer >= 1) {
            this.countdownTimer = 0;
            this.countdownTime--;
            
            if (this.countdownTime > 0) {
                this.ui.showCountdown(this.countdownTime);
            } else if (this.countdownTime === 0) {
                this.ui.showCountdown(0);
            } else {
                this.ui.hideCountdown();
                this.startRace();
            }
        }
    }

    startRace() {
        this.raceState = 'racing';
        this.raceTime = 0;
        this.lapStartTime = performance.now();
        this.lastLapWaypoint = this.playerCar.currentWaypoint;
        this.lastLapProgress = this.playerCar.raceProgress;
    }

    checkLapCompletion(car) {
        const progress = car.raceProgress;
        
        if (car.isPlayer) {
            if (this.lastLapProgress > 0.8 && progress < 0.2) {
                const lapTime = performance.now() - this.lapStartTime;
                car.lap++;
                
                this.ui.addLapTime(car.lap - 1, lapTime);
                this.lapStartTime = performance.now();
                
                if (car.lap > CONFIG.RACE.TOTAL_LAPS) {
                    this.finishRace();
                } else {
                    this.ui.updateLap(car.lap);
                }
            }
            this.lastLapProgress = progress;
        } else {
            if (car.lastLapProgress > 0.8 && progress < 0.2) {
                car.lap++;
            }
            car.lastLapProgress = progress;
        }
    }

    updatePositions() {
        const allCars = [this.playerCar, ...this.aiCars.map(ai => ai.car)];
        
        allCars.sort((a, b) => {
            const progressA = (a.lap - 1) + a.raceProgress;
            const progressB = (b.lap - 1) + b.raceProgress;
            return progressB - progressA;
        });
        
        const playerIndex = allCars.findIndex(car => car.isPlayer);
        this.ui.updatePosition(playerIndex + 1);
    }

    finishRace() {
        this.raceState = 'finished';
        
        const allCars = [this.playerCar, ...this.aiCars.map(ai => ai.car)];
        allCars.sort((a, b) => {
            const progressA = (a.lap - 1) + a.raceProgress;
            const progressB = (b.lap - 1) + b.raceProgress;
            return progressB - progressA;
        });
        
        const playerPosition = allCars.findIndex(car => car.isPlayer) + 1;
        
        this.ui.showRaceResult(
            playerPosition,
            this.raceTime,
            this.ui.lapTimes,
            this.ui.bestLapTime
        );
    }

    restartGame() {
        this.ui.reset();
        
        this.playerCar.reset();
        this.playerCar.setPosition(this.track.getStartPosition());
        this.playerCar.setRotation(this.track.getStartRotation());
        
        this.aiCars.forEach(ai => ai.reset());
        this.obstacleSystem.reset();
        this.powerupSystem.reset();
        this.cameraSystem.reset();
        
        this.raceTime = 0;
        this.lastLapWaypoint = 0;
        
        this.startCountdown();
    }

    update(deltaTime) {
        if (this.raceState === 'countdown') {
            this.updateCountdown(deltaTime);
            return;
        }
        
        if (this.raceState !== 'racing') return;
        
        this.raceTime += deltaTime * 1000;
        this.ui.updateTime(this.raceTime);
        
        this.handleInput();
        
        this.playerCar.update(deltaTime, this.track);
        
        this.aiCars.forEach(ai => ai.update(deltaTime));
        
        this.obstacleSystem.update(deltaTime);
        this.powerupSystem.update(deltaTime);
        
        const allCars = [this.playerCar, ...this.aiCars.map(ai => ai.car)];
        
        allCars.forEach(car => {
            this.collisionSystem.checkTrackBoundary(car, this.track);
            this.collisionSystem.checkCarObstacleCollision(car, this.obstacleSystem);
            
            if (car.isPlayer) {
                const pickedUp = this.collisionSystem.checkCarPowerupCollision(car, this.powerupSystem);
                if (pickedUp) {
                    this.ui.showBoostIndicator(true);
                    setTimeout(() => this.ui.showBoostIndicator(false), CONFIG.POWERUPS.BOOST_DURATION);
                }
            }
        });
        
        this.collisionSystem.checkAllCarCollisions(allCars);
        
        this.checkLapCompletion(this.playerCar);
        this.updatePositions();
        
        this.ui.updateSpeed(this.playerCar.speed);
        
        this.cameraSystem.update(deltaTime);
    }

    animate() {
        this.animFrameId = requestAnimationFrame(this.boundAnimate);
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        this.update(deltaTime);
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }
        
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
