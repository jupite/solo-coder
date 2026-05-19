import * as THREE from 'three';
import { Physics } from './Physics.js';

export class Player {
  constructor(scene, startPosition) {
    this.scene = scene;
    this.mesh = null;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3(20, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.speed = 0;
    this.terrainHeight = 0;
    this.physics = new Physics();
    this.createModel();
  }

  createModel() {
    this.mesh = new THREE.Group();

    const wingGeo = new THREE.ConeGeometry(12, 4, 4);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1
    });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.rotation.x = Math.PI / 2;
    wing.rotation.y = Math.PI / 4;
    wing.position.y = 3;
    wing.castShadow = true;
    this.mesh.add(wing);

    const frameGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.3
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.5;
    frame.castShadow = true;
    this.mesh.add(frame);

    const pilotGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const pilotMat = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      roughness: 0.6
    });
    const pilot = new THREE.Mesh(pilotGeo, pilotMat);
    pilot.position.y = -0.5;
    pilot.castShadow = true;
    this.mesh.add(pilot);

    const ropeMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const points = [];
      points.push(new THREE.Vector3(Math.cos(angle) * 8, 3, Math.sin(angle) * 8));
      points.push(new THREE.Vector3(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5));
      const ropeGeo = new THREE.BufferGeometry().setFromPoints(points);
      const rope = new THREE.Line(ropeGeo, ropeMat);
      this.mesh.add(rope);
    }

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  update(input, dt, terrain) {
    this.terrainHeight = terrain.getHeight(this.position.x, this.position.z);
    this.physics.update(this, input, dt);

    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }

  reset(startPosition) {
    this.position.copy(startPosition);
    this.velocity.set(20, 0, 0);
    this.rotation.set(0, 0, 0);
    this.speed = 0;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }
}
