import * as THREE from 'three';
import { CollisionDetector } from '../physics/Collision.js';

export class Ball {
  constructor(scene, bounds) {
    this.scene = scene;
    this.bounds = bounds;
    this.radius = 0.3;
    this.baseSpeed = 8;
    this.baseSpeedMultiplier = 1;
    this.globalSpeedMultiplier = 1;
    this.position = { x: 0, y: 2, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.trail = [];
    this.maxTrailLength = 10;
    this.isLaunched = false;

    this.createMesh();
    this.createTrail();
    this.reset();
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0xff3333,
      emissiveIntensity: 0.3
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    const glowGeometry = new THREE.SphereGeometry(this.radius * 1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.3
    });
    this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glow);
  }

  createTrail() {
    this.trailGroup = new THREE.Group();
    this.scene.add(this.trailGroup);

    for (let i = 0; i < this.maxTrailLength; i++) {
      const trailGeometry = new THREE.SphereGeometry(this.radius * (1 - i / this.maxTrailLength), 16, 16);
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.5 * (1 - i / this.maxTrailLength)
      });
      const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
      trailMesh.visible = false;
      this.trailGroup.add(trailMesh);
      this.trail.push(trailMesh);
    }
  }

  update(deltaTime, paddle) {
    if (!this.isLaunched) {
      this.position.x = paddle.position.x;
      this.position.z = paddle.position.z;
      this.position.y = paddle.position.y + this.radius + 0.3;
      this.mesh.position.set(this.position.x, this.position.y, this.position.z);
      return;
    }

    this.updateTrail();

    const currentSpeed = this.baseSpeed * this.baseSpeedMultiplier * this.globalSpeedMultiplier;
    this.position.x += this.velocity.x * currentSpeed * deltaTime;
    this.position.y += this.velocity.y * currentSpeed * deltaTime;
    this.position.z += this.velocity.z * currentSpeed * deltaTime;

    this.checkWallCollisions();

    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  updateTrail() {
    for (let i = this.trail.length - 1; i > 0; i--) {
      this.trail[i].position.copy(this.trail[i - 1].position);
      this.trail[i].visible = true;
    }
    this.trail[0].position.set(this.position.x, this.position.y, this.position.z);
    this.trail[0].visible = true;
  }

  checkWallCollisions() {
    const bounds = this.bounds;

    if (this.position.x - this.radius < bounds.minX) {
      this.position.x = bounds.minX + this.radius;
      this.velocity.x = Math.abs(this.velocity.x);
    }
    if (this.position.x + this.radius > bounds.maxX) {
      this.position.x = bounds.maxX - this.radius;
      this.velocity.x = -Math.abs(this.velocity.x);
    }

    if (this.position.z - this.radius < bounds.minZ) {
      this.position.z = bounds.minZ + this.radius;
      this.velocity.z = Math.abs(this.velocity.z);
    }
    if (this.position.z + this.radius > bounds.maxZ) {
      this.position.z = bounds.maxZ - this.radius;
      this.velocity.z = -Math.abs(this.velocity.z);
    }

    if (this.position.y + this.radius > 7) {
      this.position.y = 7 - this.radius;
      this.velocity.y = -Math.abs(this.velocity.y);
    }
  }

  checkPaddleCollision(paddle) {
    const normal = CollisionDetector.checkPaddleCollision(this, paddle);
    if (normal) {
      this.velocity = CollisionDetector.reflectVelocity(this.velocity, normal);

      const speed = Math.sqrt(
        this.velocity.x ** 2 +
        this.velocity.y ** 2 +
        this.velocity.z ** 2
      );
      if (speed > 0) {
        this.velocity.x /= speed;
        this.velocity.y /= speed;
        this.velocity.z /= speed;
      }

      if (this.velocity.y < 0.3) {
        this.velocity.y = 0.3;
        const len = Math.sqrt(
          this.velocity.x ** 2 +
          this.velocity.y ** 2 +
          this.velocity.z ** 2
        );
        this.velocity.x /= len;
        this.velocity.y /= len;
        this.velocity.z /= len;
      }

      return true;
    }
    return false;
  }

  checkBrickCollision(brick) {
    const brickBox = CollisionDetector.getBrickBox(brick);
    const sphere = {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      radius: this.radius
    };

    if (CollisionDetector.checkSphereBox(sphere, brickBox)) {
      const normal = CollisionDetector.getCollisionNormal(sphere, brickBox);
      this.velocity = CollisionDetector.reflectVelocity(this.velocity, normal);
      return true;
    }
    return false;
  }

  isOutOfBounds() {
    return this.position.y < -1;
  }

  launch() {
    if (!this.isLaunched) {
      this.isLaunched = true;
      const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
      this.velocity.x = Math.sin(angle);
      this.velocity.y = 0.7;
      this.velocity.z = -Math.cos(angle);

      const speed = Math.sqrt(
        this.velocity.x ** 2 +
        this.velocity.y ** 2 +
        this.velocity.z ** 2
      );
      this.velocity.x /= speed;
      this.velocity.y /= speed;
      this.velocity.z /= speed;
    }
  }

  launchFrom(position, velocity, speedMultiplier = 1) {
    this.isLaunched = true;
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.baseSpeedMultiplier = speedMultiplier;
  }

  setSpeedMultiplier(multiplier) {
    this.baseSpeedMultiplier = Math.min(multiplier, 2.5);
  }

  setGlobalSpeedMultiplier(multiplier) {
    this.globalSpeedMultiplier = multiplier;
  }

  reset() {
    this.position = { x: 0, y: 2, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.isLaunched = false;
    this.baseSpeedMultiplier = 1;
    this.globalSpeedMultiplier = 1;
    this.trail.forEach(t => t.visible = false);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.trailGroup);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
