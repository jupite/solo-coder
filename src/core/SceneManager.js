import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants.js';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createEnvironment();
        this.handleResize();
        
        window.addEventListener('resize', () => this.handleResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLORS.SKY);
        this.scene.fog = new THREE.Fog(COLORS.FOG, 50, 300);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    createEnvironment() {
        const horizonGeometry = new THREE.SphereGeometry(500, 32, 32);
        const horizonMaterial = new THREE.MeshBasicMaterial({
            color: COLORS.SKY,
            side: THREE.BackSide,
        });
        const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
        this.scene.add(horizon);
    }
    
    updateCamera(playerPosition, playerSpeed, deltaTime) {
        const speedFactor = Math.min(playerSpeed / GAME_CONFIG.PLAYER_SPEED_MAX, 1);
        const targetFov = 75 + speedFactor * 15;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, deltaTime * 2);
        this.camera.updateProjectionMatrix();
        
        const cameraX = playerPosition.x;
        const cameraZ = playerPosition.z + GAME_CONFIG.CAMERA_DISTANCE_BEHIND;
        const cameraY = playerPosition.y + GAME_CONFIG.CAMERA_HEIGHT_ABOVE;
        
        this.camera.position.x = THREE.MathUtils.lerp(
            this.camera.position.x,
            cameraX,
            deltaTime * 5
        );
        this.camera.position.y = THREE.MathUtils.lerp(
            this.camera.position.y,
            cameraY,
            deltaTime * 5
        );
        this.camera.position.z = THREE.MathUtils.lerp(
            this.camera.position.z,
            cameraZ,
            deltaTime * 5
        );
        
        const lookAtX = playerPosition.x;
        const lookAtY = playerPosition.y + 1;
        const lookAtZ = playerPosition.z - GAME_CONFIG.CAMERA_LOOK_AHEAD;
        
        this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    getDeltaTime() {
        return Math.min(this.clock.getDelta(), 0.1);
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
}
