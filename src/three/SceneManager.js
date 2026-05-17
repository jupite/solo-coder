import * as THREE from 'three';
import { GameConfig } from '../game/GameConfig.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.animationId = null;
    this.updateCallbacks = [];

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    this.camera.position.set(
      GameConfig.CAMERA_POSITION.x,
      GameConfig.CAMERA_POSITION.y,
      GameConfig.CAMERA_POSITION.z
    );
    this.camera.lookAt(0, 3, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.setupGrid();
    this.setupGround();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  setupGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
  }

  setupGround() {
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  addUpdateCallback(callback) {
    this.updateCallbacks.push(callback);
  }

  removeUpdateCallback(callback) {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  updateCameraHeight(layer) {
    const targetY = GameConfig.CAMERA_POSITION.y + layer * 0.3;
    const targetLookAtY = layer * GameConfig.BLOCK_HEIGHT - 1;
    this.camera.position.y = targetY;
    this.camera.lookAt(0, targetLookAtY, 0);
  }

  forceResize() {
    this.onResize();
  }

  startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const deltaTime = this.clock.getDelta();

      this.updateCallbacks.forEach(callback => callback(deltaTime));

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }

  dispose() {
    this.stopAnimation();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
