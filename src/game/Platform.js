import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PHYSICS, COLORS } from '../utils/constants.js';

export class Platform {
  constructor(sceneManager, physicsEngine) {
    this.sceneManager = sceneManager;
    this.physicsEngine = physicsEngine;
    this.mesh = null;
    this.body = null;
    this.edgeMesh = null;
    this.init();
  }

  init() {
    const size = PHYSICS.platformSize;
    const thickness = PHYSICS.platformThickness;

    const geometry = new THREE.BoxGeometry(size, thickness, size);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.platform,
      metalness: 0.3,
      roughness: 0.5,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.position.y = -thickness / 2;
    this.sceneManager.add(this.mesh);

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: COLORS.platformEdge,
      linewidth: 2,
    });
    this.edgeMesh = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    this.edgeMesh.position.copy(this.mesh.position);
    this.sceneManager.add(this.edgeMesh);

    const gridHelper = new THREE.GridHelper(size, 20, 0x4a5a6a, 0x3a4a5a);
    gridHelper.position.y = thickness / 2 + 0.001;
    this.mesh.add(gridHelper);

    const halfSize = size / 2;
    const shape = new CANNON.Box(new CANNON.Vec3(halfSize, thickness / 2, halfSize));
    
    this.body = new CANNON.Body({
      mass: 0,
      material: this.physicsEngine.platformMaterial,
      type: CANNON.Body.STATIC,
    });
    this.body.addShape(shape);
    this.body.position.set(0, -thickness / 2, 0);
    
    this.physicsEngine.addBody('platform', this.body);
  }

  updateTilt(tiltXRad, tiltYRad) {
    this.mesh.rotation.x = tiltXRad;
    this.mesh.rotation.z = tiltYRad;
    this.edgeMesh.rotation.x = tiltXRad;
    this.edgeMesh.rotation.z = tiltYRad;
    
    this.body.quaternion.setFromEuler(tiltXRad, 0, tiltYRad);
  }

  reset() {
    this.updateTilt(0, 0);
  }
}
