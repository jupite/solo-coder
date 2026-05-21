import * as THREE from 'three';
import { CONFIG } from './config.js';

export class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.waterMesh = null;
    this.cliffEdgePosition = new THREE.Vector3(0, CONFIG.CLIFF_HEIGHT, CONFIG.CLIFF_DEPTH / 2);
    this.createSky();
    this.createCliff();
    this.createPool();
    this.createLighting();
  }

  createSky() {
    this.scene.background = new THREE.Color(CONFIG.COLORS.SKY);
    this.scene.fog = new THREE.Fog(CONFIG.COLORS.SKY, 50, 150);
  }

  createCliff() {
    const cliffGroup = new THREE.Group();

    const mainCliffGeo = new THREE.BoxGeometry(
      CONFIG.CLIFF_WIDTH,
      CONFIG.CLIFF_HEIGHT,
      CONFIG.CLIFF_DEPTH
    );
    const cliffMaterial = new THREE.MeshLambertMaterial({
      color: CONFIG.COLORS.CLIFF,
      flatShading: true
    });
    const mainCliff = new THREE.Mesh(mainCliffGeo, cliffMaterial);
    mainCliff.position.set(0, CONFIG.CLIFF_HEIGHT / 2, 0);
    mainCliff.receiveShadow = true;
    cliffGroup.add(mainCliff);

    const topGeo = new THREE.BoxGeometry(
      CONFIG.CLIFF_WIDTH + 1,
      1,
      CONFIG.CLIFF_DEPTH + 1
    );
    const topMaterial = new THREE.MeshLambertMaterial({
      color: 0x3d5c3d,
      flatShading: true
    });
    const topSurface = new THREE.Mesh(topGeo, topMaterial);
    topSurface.position.set(0, CONFIG.CLIFF_HEIGHT + 0.5, 0);
    topSurface.receiveShadow = true;
    cliffGroup.add(topSurface);

    const edgeGeo = new THREE.BoxGeometry(
      CONFIG.CLIFF_WIDTH - 1,
      0.3,
      1.5
    );
    const edgeMaterial = new THREE.MeshLambertMaterial({
      color: 0x5a5a5a,
      flatShading: true
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMaterial);
    edge.position.set(0, CONFIG.CLIFF_HEIGHT + 1.1, CONFIG.CLIFF_DEPTH / 2 + 0.5);
    cliffGroup.add(edge);

    this.cliffGroup = cliffGroup;
    this.scene.add(cliffGroup);
  }

  createPool() {
    const poolGroup = new THREE.Group();

    const waterGeo = new THREE.PlaneGeometry(
      CONFIG.POOL_WIDTH,
      CONFIG.POOL_DEPTH
    );
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: CONFIG.COLORS.WATER,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      shininess: 100
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMaterial);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, CONFIG.WATER_LEVEL, CONFIG.CLIFF_DEPTH / 2 + 10);
    this.waterMesh.receiveShadow = true;
    poolGroup.add(this.waterMesh);

    const poolBottomGeo = new THREE.BoxGeometry(
      CONFIG.POOL_WIDTH,
      2,
      CONFIG.POOL_DEPTH
    );
    const poolBottomMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a4a6e
    });
    const poolBottom = new THREE.Mesh(poolBottomGeo, poolBottomMaterial);
    poolBottom.position.set(0, -1, CONFIG.CLIFF_DEPTH / 2 + 10);
    poolGroup.add(poolBottom);

    const wallGeo1 = new THREE.BoxGeometry(1, 8, CONFIG.POOL_DEPTH);
    const wallMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B7355
    });

    const leftWall = new THREE.Mesh(wallGeo1, wallMaterial);
    leftWall.position.set(-CONFIG.POOL_WIDTH / 2 - 0.5, 3, CONFIG.CLIFF_DEPTH / 2 + 10);
    poolGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo1, wallMaterial);
    rightWall.position.set(CONFIG.POOL_WIDTH / 2 + 0.5, 3, CONFIG.CLIFF_DEPTH / 2 + 10);
    poolGroup.add(rightWall);

    const wallGeo2 = new THREE.BoxGeometry(CONFIG.POOL_WIDTH + 2, 8, 1);
    const backWall = new THREE.Mesh(wallGeo2, wallMaterial);
    backWall.position.set(0, 3, CONFIG.CLIFF_DEPTH / 2 + 10 + CONFIG.POOL_DEPTH / 2 + 0.5);
    poolGroup.add(backWall);

    this.poolGroup = poolGroup;
    this.scene.add(poolGroup);
  }

  createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 30, 10);
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

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.4);
    this.scene.add(hemisphereLight);
  }

  getWaterPosition() {
    return this.waterMesh.position.clone();
  }

  getWaterY() {
    return CONFIG.WATER_LEVEL;
  }

  getCliffEdgePosition() {
    return this.cliffEdgePosition.clone();
  }

  updateWaterAnimation(time) {
    if (this.waterMesh) {
      this.waterMesh.material.opacity = 0.75 + Math.sin(time * 2) * 0.05;
    }
  }
}
