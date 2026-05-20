import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Track } from './Track.js';
import { Cart } from './Cart.js';
import { Player } from './Player.js';
import { Obstacles } from './Obstacles.js';
import { Collectibles } from './Collectibles.js';
import { Input } from '../utils/Input.js';
import { UI } from '../utils/UI.js';
import { GAME_CONFIG, COLORS, GAME_STATES } from '../config/constants.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        this.track = null;
        this.cart = null;
        this.player = null;
        this.obstacles = null;
        this.collectibles = null;
        this.input = null;
        this.ui = null;
        
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.lives = GAME_CONFIG.MAX_LIVES;
        this.distance = 0;
        
        this.cameraOffset = new THREE.Vector3(0, 4, 8);
        this.cameraLookOffset = new THREE.Vector3(0, 1.5, -8);
        
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLORS.FOG);
        this.scene.fog = new THREE.Fog(COLORS.FOG, 20, 80);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffaa44, 0.6, 30);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);

        this.clock = new THREE.Clock();
        this.input = new Input();
        this.ui = new UI();

        window.addEventListener('resize', () => this.onResize());

        this.ui.init(() => this.startGame(), () => this.restartGame());

        this.createMenuScene();

        this.animate();
    }

    createMenuScene() {
        const menuGeometry = new THREE.TorusKnotGeometry(5, 1.5, 100, 16);
        const menuMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3,
            metalness: 0.8,
        });
        this.menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
        this.menuMesh.position.set(0, 0, -20);
        this.menuMesh.castShadow = true;
        this.scene.add(this.menuMesh);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
    }

    startGame() {
        if (this.menuMesh) {
            this.scene.remove(this.menuMesh);
            this.menuMesh.geometry.dispose();
            this.menuMesh.material.dispose();
            this.menuMesh = null;
        }

        this.track = new Track(this.scene);
        this.cart = new Cart(this.scene, this.track);
        this.player = new Player(this.scene, this.cart);
        this.obstacles = new Obstacles(this.scene, this.track);
        this.collectibles = new Collectibles(this.scene, this.track);

        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = GAME_CONFIG.MAX_LIVES;
        this.distance = 0;
        this.ui.reset();
    }

    restartGame() {
        this.disposeGameObjects();
        this.startGame();
    }

    disposeGameObjects() {
        if (this.track) this.track.dispose();
        if (this.cart) this.cart.dispose();
        if (this.player) this.player.dispose();
        if (this.obstacles) this.obstacles.dispose();
        if (this.collectibles) this.collectibles.dispose();
    }

    update(deltaTime) {
        if (this.state === GAME_STATES.MENU) {
            if (this.menuMesh) {
                this.menuMesh.rotation.x += deltaTime * 0.3;
                this.menuMesh.rotation.y += deltaTime * 0.5;
            }
            return;
        }

        if (this.state === GAME_STATES.GAME_OVER) {
            if (this.cart) {
                this.updateCamera();
            }
            return;
        }

        if (this.state !== GAME_STATES.PLAYING || !this.cart || !this.player || !this.obstacles || !this.collectibles) return;

        if (this.input.isMovingLeft()) {
            this.cart.moveLeft();
        }
        if (this.input.isMovingRight()) {
            this.cart.moveRight();
        }
        if (this.input.isJumping()) {
            this.cart.jump();
        }
        this.player.crouch(this.input.isCrouching());

        this.cart.update(deltaTime);
        this.player.update(deltaTime);

        const playerLane = this.cart.targetLane;
        const playerHeight = this.player.getEffectiveHeight();
        const isJumping = this.cart.isInAir();
        const isCrouching = this.player.isCrouching;

        const obstacleResult = this.obstacles.update(
            this.cart.progress,
            playerLane,
            playerHeight,
            isJumping,
            isCrouching
        );

        if (obstacleResult.collision) {
            this.onCollision();
        }

        const collected = this.collectibles.update(
            this.cart.progress,
            this.cart.laneOffset,
            deltaTime
        );

        if (collected > 0) {
            this.score = this.ui.addScore(collected * GAME_CONFIG.GOLD_SCORE);
        }

        this.distance += this.cart.speed * 1000;
        this.ui.updateSpeed(this.cart.speed);

        this.updateCamera();

        this.input.clearPressed();
    }

    onCollision() {
        this.lives = this.ui.loseLife();
        this.cart.slowDown();

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        this.ui.showGameOver(this.score);
    }

    updateCamera() {
        if (!this.cart) return;

        const cartPos = this.cart.getPosition();
        const forward = this.cart.getForwardDirection();
        
        const cameraPosition = new THREE.Vector3()
            .copy(cartPos)
            .add(new THREE.Vector3(0, this.cameraOffset.y, 0))
            .add(forward.clone().negate().multiplyScalar(this.cameraOffset.z));

        const lookAtPosition = new THREE.Vector3()
            .copy(cartPos)
            .add(new THREE.Vector3(0, this.cameraLookOffset.y, 0))
            .add(forward.clone().multiplyScalar(Math.abs(this.cameraLookOffset.z)));

        this.camera.position.lerp(cameraPosition, 0.1);
        this.camera.lookAt(lookAtPosition);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        this.update(deltaTime);

        this.renderer.render(this.scene, this.camera);
    }
}
