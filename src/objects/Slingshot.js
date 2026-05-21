import * as THREE from 'three';
import { COLORS, CONSTANTS } from '../game/constants.js';

export class Slingshot {
  constructor(scene, position) {
    this.scene = scene;
    this.position = position.clone();
    this.mesh = null;
    this.rubberBandLeft = null;
    this.rubberBandRight = null;
    this.pouch = null;
    
    this.leftForkPos = new THREE.Vector3();
    this.rightForkPos = new THREE.Vector3();
    
    this.createMesh();
  }

  createMesh() {
    const slingshotGroup = new THREE.Group();

    const handleGeometry = new THREE.CylinderGeometry(0.08, 0.12, 2, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SLINGSHOT,
      flatShading: true
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 1;
    handle.castShadow = true;
    slingshotGroup.add(handle);

    const forkGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
    
    const leftFork = new THREE.Mesh(forkGeometry, handleMaterial);
    leftFork.position.set(0.3, 2.2, 0);
    leftFork.rotation.z = -0.3;
    leftFork.castShadow = true;
    slingshotGroup.add(leftFork);

    const rightFork = new THREE.Mesh(forkGeometry, handleMaterial);
    rightFork.position.set(-0.3, 2.2, 0);
    rightFork.rotation.z = 0.3;
    rightFork.castShadow = true;
    slingshotGroup.add(rightFork);

    const forkBaseGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8);
    const forkBase = new THREE.Mesh(forkBaseGeometry, handleMaterial);
    forkBase.position.set(0, 2, 0);
    forkBase.rotation.z = Math.PI / 2;
    forkBase.castShadow = true;
    slingshotGroup.add(forkBase);

    slingshotGroup.position.copy(this.position);
    this.mesh = slingshotGroup;
    this.scene.add(this.mesh);

    this.leftForkPos.set(0.3 + this.position.x, 2.8 + this.position.y, this.position.z);
    this.rightForkPos.set(-0.3 + this.position.x, 2.8 + this.position.y, this.position.z);

    this.createRubberBand();
  }

  createRubberBand() {
    const rubberMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.RUBBER_BAND,
      roughness: 0.6,
      metalness: 0.1
    });

    this.rubberTubeMaterial = rubberMaterial;

    const leftCurve = new THREE.LineCurve3(
      this.leftForkPos.clone(),
      this.getRestPosition()
    );
    const leftGeometry = new THREE.TubeGeometry(leftCurve, 8, 0.03, 6, false);
    this.rubberBandLeft = new THREE.Mesh(leftGeometry, rubberMaterial);
    this.scene.add(this.rubberBandLeft);

    const rightCurve = new THREE.LineCurve3(
      this.rightForkPos.clone(),
      this.getRestPosition()
    );
    const rightGeometry = new THREE.TubeGeometry(rightCurve, 8, 0.03, 6, false);
    this.rubberBandRight = new THREE.Mesh(rightGeometry, rubberMaterial);
    this.scene.add(this.rubberBandRight);

    const pouchGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const pouchMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      flatShading: true
    });
    this.pouch = new THREE.Mesh(pouchGeometry, pouchMaterial);
    this.pouch.position.copy(this.getRestPosition());
    this.scene.add(this.pouch);
  }

  getRestPosition() {
    return new THREE.Vector3(
      this.position.x,
      this.position.y + 2.5,
      this.position.z
    );
  }

  updateRubberBand(pullPosition) {
    const restPos = this.getRestPosition();
    const direction = pullPosition.clone().sub(restPos);
    const distance = direction.length();
    
    if (distance > CONSTANTS.MAX_DRAG_DISTANCE) {
      direction.normalize().multiplyScalar(CONSTANTS.MAX_DRAG_DISTANCE);
      pullPosition.copy(restPos).add(direction);
    }

    if (this.rubberBandLeft.geometry) {
      this.rubberBandLeft.geometry.dispose();
    }
    const leftCurve = new THREE.LineCurve3(
      this.leftForkPos.clone(),
      pullPosition.clone()
    );
    this.rubberBandLeft.geometry = new THREE.TubeGeometry(leftCurve, 8, 0.03, 6, false);

    if (this.rubberBandRight.geometry) {
      this.rubberBandRight.geometry.dispose();
    }
    const rightCurve = new THREE.LineCurve3(
      this.rightForkPos.clone(),
      pullPosition.clone()
    );
    this.rubberBandRight.geometry = new THREE.TubeGeometry(rightCurve, 8, 0.03, 6, false);

    this.pouch.position.copy(pullPosition);
    
    return pullPosition;
  }

  resetRubberBand() {
    const restPos = this.getRestPosition();
    this.updateRubberBand(restPos);
  }

  showPouch(show) {
    this.pouch.visible = show;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.rubberBandLeft);
    this.scene.remove(this.rubberBandRight);
    this.scene.remove(this.pouch);
  }
}
