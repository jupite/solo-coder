import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.velocity = new THREE.Vector3();
    this.isInAir = false;
    this.hasEnteredWater = false;
    this.angularVelocity = new THREE.Vector3();
    this.rotationX = 0;
    this.rotationZ = 0;

    this.createBody();
    this.group.position.set(0, CONFIG.CLIFF_HEIGHT + 1.1, 0);
    this.scene.add(this.group);
  }

  createBody() {
    const skinMaterial = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.SKIN });
    const swimsuitMaterial = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.SWIMSUIT });

    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMaterial);
    this.head.position.y = 1.55;
    this.head.castShadow = true;
    this.group.add(this.head);

    const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 1.35;
    this.group.add(neck);

    const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
    const torso = new THREE.Mesh(torsoGeo, swimsuitMaterial);
    torso.position.y = 0.95;
    torso.castShadow = true;
    this.group.add(torso);

    const hipGeo = new THREE.BoxGeometry(0.45, 0.25, 0.28);
    const hip = new THREE.Mesh(hipGeo, swimsuitMaterial);
    hip.position.y = 0.5;
    this.group.add(hip);

    this.leftArm = new THREE.Group();
    const upperArmLGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8);
    const upperArmL = new THREE.Mesh(upperArmLGeo, skinMaterial);
    upperArmL.position.y = -0.2;
    this.leftArm.add(upperArmL);
    const forearmLGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8);
    const forearmL = new THREE.Mesh(forearmLGeo, skinMaterial);
    forearmL.position.y = -0.55;
    this.leftArm.add(forearmL);
    const handLGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const handL = new THREE.Mesh(handLGeo, skinMaterial);
    handL.position.y = -0.78;
    this.leftArm.add(handL);
    this.leftArm.position.set(-0.3, 1.2, 0);
    this.leftArm.rotation.z = 0.3;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    const upperArmRGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8);
    const upperArmR = new THREE.Mesh(upperArmRGeo, skinMaterial);
    upperArmR.position.y = -0.2;
    this.rightArm.add(upperArmR);
    const forearmRGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8);
    const forearmR = new THREE.Mesh(forearmRGeo, skinMaterial);
    forearmR.position.y = -0.55;
    this.rightArm.add(forearmR);
    const handRGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const handR = new THREE.Mesh(handRGeo, skinMaterial);
    handR.position.y = -0.78;
    this.rightArm.add(handR);
    this.rightArm.position.set(0.3, 1.2, 0);
    this.rightArm.rotation.z = -0.3;
    this.group.add(this.rightArm);

    this.leftLeg = new THREE.Group();
    const thighLGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 8);
    const thighL = new THREE.Mesh(thighLGeo, swimsuitMaterial);
    thighL.position.y = -0.22;
    this.leftLeg.add(thighL);
    const calfLGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const calfL = new THREE.Mesh(calfLGeo, skinMaterial);
    calfL.position.y = -0.65;
    this.leftLeg.add(calfL);
    const footLGeo = new THREE.BoxGeometry(0.12, 0.05, 0.2);
    const footL = new THREE.Mesh(footLGeo, skinMaterial);
    footL.position.set(0, -0.9, 0.05);
    this.leftLeg.add(footL);
    this.leftLeg.position.set(-0.12, 0.35, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    const thighRGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 8);
    const thighR = new THREE.Mesh(thighRGeo, swimsuitMaterial);
    thighR.position.y = -0.22;
    this.rightLeg.add(thighR);
    const calfRGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const calfR = new THREE.Mesh(calfRGeo, skinMaterial);
    calfR.position.y = -0.65;
    this.rightLeg.add(calfR);
    const footRGeo = new THREE.BoxGeometry(0.12, 0.05, 0.2);
    const footR = new THREE.Mesh(footRGeo, skinMaterial);
    footR.position.set(0, -0.9, 0.05);
    this.rightLeg.add(footR);
    this.rightLeg.position.set(0.12, 0.35, 0);
    this.group.add(this.rightLeg);
  }

  reset(startPosition) {
    this.group.position.copy(startPosition);
    this.velocity.set(0, 0, 0);
    this.isInAir = false;
    this.hasEnteredWater = false;
    this.angularVelocity.set(0, 0, 0);
    this.rotationX = 0;
    this.rotationZ = 0;
    this.group.rotation.set(0, 0, 0);
    this.setStandingPose();
  }

  setStandingPose() {
    this.leftArm.rotation.z = 0.3;
    this.rightArm.rotation.z = -0.3;
    this.leftArm.rotation.x = 0;
    this.rightArm.rotation.x = 0;
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
  }

  setDivingPose() {
    this.leftArm.rotation.z = 0;
    this.rightArm.rotation.z = 0;
    this.leftArm.rotation.x = Math.PI * 0.6;
    this.rightArm.rotation.x = Math.PI * 0.6;
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
  }

  jump(power) {
    this.isInAir = true;
    this.hasEnteredWater = false;
    this.velocity.set(0, power, power * 0.3);
    this.setDivingPose();
  }

  applyRotation(deltaX, deltaZ) {
    this.rotationX += deltaX;
    this.rotationZ += deltaZ;
    this.group.rotation.x = this.rotationX;
    this.group.rotation.z = this.rotationZ;
  }

  updatePhysics(deltaTime) {
    if (!this.isInAir) return;

    this.velocity.y += CONFIG.GRAVITY * deltaTime;

    this.group.position.x += this.velocity.x * deltaTime;
    this.group.position.y += this.velocity.y * deltaTime;
    this.group.position.z += this.velocity.z * deltaTime;

    if (this.angularVelocity.length() > 0.01) {
      this.applyRotation(
        this.angularVelocity.x * deltaTime,
        this.angularVelocity.z * deltaTime
      );
    }
  }

  getVerticalAlignment() {
    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(this.group.quaternion);
    const dot = Math.abs(up.y);
    return dot;
  }

  getPosition() {
    return this.group.position.clone();
  }

  getRotationEuler() {
    return new THREE.Euler(this.rotationX, 0, this.rotationZ);
  }
}
