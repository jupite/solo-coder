import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 15, 50);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(8, 8, 12);
    this.camera.lookAt(0, 2, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    this.controls.target.set(0, 2, 0);

    this.clock = new THREE.Clock();

    this.setupLights();
    this.setupEnvironment();
    this.setupEventListeners();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x6495ed, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xffd700, 0.5, 20);
    pointLight.position.set(0, 8, 0);
    this.scene.add(pointLight);
  }

  setupEnvironment() {
    const groundGeometry = new THREE.CircleGeometry(20, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const gridHelper = new THREE.GridHelper(20, 40, 0x0f3460, 0x0f3460);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    const pedestalGeometry = new THREE.CylinderGeometry(2.5, 2.8, 0.5, 32);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a4a,
      roughness: 0.3,
      metalness: 0.7
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = 0.25;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    const pedestalTopGeometry = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 32);
    const pedestalTopMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a5a,
      roughness: 0.2,
      metalness: 0.8
    });
    const pedestalTop = new THREE.Mesh(pedestalTopGeometry, pedestalTopMaterial);
    pedestalTop.position.y = 0.55;
    this.scene.add(pedestalTop);

    const ghostGeometry = new THREE.CylinderGeometry(2.4, 2.4, 0.05, 32);
    const ghostMaterial = new THREE.MeshBasicMaterial({
      color: 0x64c8ff,
      transparent: true,
      opacity: 0.3
    });
    this.ghostPedestal = new THREE.Mesh(ghostGeometry, ghostMaterial);
    this.ghostPedestal.position.y = 0.6;
    this.scene.add(this.ghostPedestal);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getRaycaster() {
    return this.raycaster;
  }

  getMouse() {
    return this.mouse;
  }

  updateMouse(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  getIntersects(objects) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  getDelta() {
    return this.clock.getDelta();
  }

  getElapsed() {
    return this.clock.getElapsedTime();
  }
}

export default SceneManager;
