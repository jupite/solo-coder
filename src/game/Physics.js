import * as THREE from 'three';
import { clamp, degToRad } from '../utils/math.js';

export class Physics {
  constructor() {
    this.gravity = new THREE.Vector3(0, -9.8, 0);
    this.airDensity = 1.225;
    this.liftCoefficient = 0.8;
    this.dragCoefficient = 0.05;
    this.wingArea = 20;
    this.mass = 80;
    this.minSpeed = 5;
    this.maxSpeed = 50;
    this.angleOfAttack = 0;
  }

  calculateLift(velocity, angleOfAttack) {
    const speed = velocity.length();
    if (speed < this.minSpeed) return new THREE.Vector3();

    const dynamicPressure = 0.5 * this.airDensity * speed * speed;
    const liftMagnitude = dynamicPressure * this.liftCoefficient * this.wingArea;

    const angleRad = degToRad(angleOfAttack);
    const liftMultiplier = Math.sin(angleRad * 2);

    const liftDir = new THREE.Vector3(0, 1, 0);
    return liftDir.multiplyScalar(liftMagnitude * liftMultiplier);
  }

  calculateDrag(velocity) {
    const speed = velocity.length();
    if (speed < 0.1) return new THREE.Vector3();

    const dynamicPressure = 0.5 * this.airDensity * speed * speed;
    const dragMagnitude = dynamicPressure * this.dragCoefficient * this.wingArea;

    const dragDir = velocity.clone().normalize().negate();
    return dragDir.multiplyScalar(dragMagnitude);
  }

  calculateThrust(forwardDir, speed) {
    if (speed < this.minSpeed) {
      return forwardDir.clone().multiplyScalar(50);
    }
    return new THREE.Vector3();
  }

  update(player, input, dt) {
    const { position, velocity, rotation } = player;

    const rollSpeed = 2;
    const pitchSpeed = 1.5;
    const yawSpeed = 1;

    rotation.x += input.pitchInput * pitchSpeed * dt;
    rotation.z += input.rollInput * rollSpeed * dt;
    rotation.y += input.yawInput * yawSpeed * dt;

    rotation.z = clamp(rotation.z, -degToRad(45), degToRad(45));
    rotation.x = clamp(rotation.x, -degToRad(30), degToRad(30));

    const yawFromRoll = rotation.z * 0.5 * dt;
    rotation.y += yawFromRoll;

    const forwardDir = new THREE.Vector3(
      -Math.sin(rotation.y) * Math.cos(rotation.x),
      Math.sin(rotation.x),
      -Math.cos(rotation.y) * Math.cos(rotation.x)
    ).normalize();

    const speed = velocity.length();
    this.angleOfAttack = rotation.x * 180 / Math.PI + 5;
    this.angleOfAttack = clamp(this.angleOfAttack, -15, 20);

    const lift = this.calculateLift(velocity, this.angleOfAttack);
    const drag = this.calculateDrag(velocity);
    const thrust = this.calculateThrust(forwardDir, speed);

    const gravityForce = this.gravity.clone().multiplyScalar(this.mass);

    const totalForce = new THREE.Vector3()
      .add(lift)
      .add(drag)
      .add(thrust)
      .add(gravityForce);

    const acceleration = totalForce.divideScalar(this.mass);
    velocity.add(acceleration.multiplyScalar(dt));

    const currentSpeed = velocity.length();
    if (currentSpeed > this.maxSpeed) {
      velocity.multiplyScalar(this.maxSpeed / currentSpeed);
    }

    position.add(velocity.clone().multiplyScalar(dt));

    if (position.y < player.terrainHeight + 2) {
      position.y = player.terrainHeight + 2;
      velocity.multiplyScalar(0.95);
      velocity.y = Math.max(0, velocity.y);
    }

    rotation.z *= (1 - 2 * dt);

    player.speed = currentSpeed;
  }
}
