import * as THREE from 'three';

export class GameScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 20, 50);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLights();
    this.setupWalls();
    this.setupFloor();

    window.addEventListener('resize', () => this.onResize());
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 15, 10);
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

    const pointLight = new THREE.PointLight(0x667eea, 0.5, 30);
    pointLight.position.set(-8, 5, 8);
    this.scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x764ba2, 0.5, 30);
    pointLight2.position.set(8, 5, -8);
    this.scene.add(pointLight2);
  }

  setupWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a4e,
      transparent: true,
      opacity: 0.3,
      metalness: 0.3,
      roughness: 0.7
    });

    const wallHeight = 8;
    const wallThickness = 0.5;

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, 20),
      wallMaterial
    );
    leftWall.position.set(-10, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, 20),
      wallMaterial
    );
    rightWall.position.set(10, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(20, wallHeight, wallThickness),
      wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -10);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(20, wallHeight, wallThickness),
      wallMaterial
    );
    frontWall.position.set(0, wallHeight / 2, 10);
    frontWall.receiveShadow = true;
    this.scene.add(frontWall);
  }

  setupFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f1e,
      metalness: 0.2,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const gridHelper = new THREE.GridHelper(20, 20, 0x444477, 0x333355);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getBounds() {
    return {
      minX: -9.5,
      maxX: 9.5,
      minZ: -9.5,
      maxZ: 9.5
    };
  }
}
