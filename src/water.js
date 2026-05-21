import * as THREE from 'three';
import { CONFIG } from './config.js';

export class WaterSplash {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.splashGroup = new THREE.Group();
    this.scene.add(this.splashGroup);
    this.active = false;
  }

  createSplash(position, verticalAlignment) {
    this.clearSplash();
    this.active = true;

    const splashIntensity = 1.0 - verticalAlignment;
    const particleCount = Math.floor(CONFIG.WATER_SPLASH_COUNT * splashIntensity);

    const waterMaterial = new THREE.MeshPhongMaterial({
      color: CONFIG.COLORS.WATER,
      transparent: true,
      opacity: 0.9,
      shininess: 100
    });

    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(
        0.05 + Math.random() * 0.1 * splashIntensity,
        6,
        6
      );
      const particle = new THREE.Mesh(particleGeo, waterMaterial.clone());

      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * CONFIG.WATER_SPLASH_SPREAD * splashIntensity;
      const height = Math.random() * CONFIG.WATER_SPLASH_HEIGHT * splashIntensity;

      particle.position.set(
        position.x + Math.cos(angle) * radius,
        position.y + height,
        position.z + Math.sin(angle) * radius
      );

      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5 * splashIntensity,
          3 + Math.random() * 5 * splashIntensity,
          (Math.random() - 0.5) * 5 * splashIntensity
        ),
        life: 1.0,
        decay: 0.5 + Math.random() * 0.5
      };

      this.splashGroup.add(particle);
      this.particles.push(particle);
    }

    const rippleGeo = new THREE.RingGeometry(0.1, 0.3, 32);
    const rippleMaterial = new THREE.MeshPhongMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    this.ripple = new THREE.Mesh(rippleGeo, rippleMaterial);
    this.ripple.rotation.x = -Math.PI / 2;
    this.ripple.position.set(position.x, 0.01, position.z);
    this.ripple.userData = { scale: 1, maxScale: 5 + splashIntensity * 5 };
    this.splashGroup.add(this.ripple);
  }

  update(deltaTime) {
    if (!this.active) return;

    let allDead = true;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const data = particle.userData;

      data.velocity.y += CONFIG.GRAVITY * deltaTime * 0.5;
      particle.position.x += data.velocity.x * deltaTime;
      particle.position.y += data.velocity.y * deltaTime;
      particle.position.z += data.velocity.z * deltaTime;

      data.life -= data.decay * deltaTime;
      particle.material.opacity = data.life * 0.9;
      particle.scale.setScalar(Math.max(0.1, data.life));

      if (data.life <= 0 || particle.position.y < CONFIG.WATER_LEVEL) {
        this.splashGroup.remove(particle);
        this.particles.splice(i, 1);
      } else {
        allDead = false;
      }
    }

    if (this.ripple) {
      this.ripple.userData.scale += deltaTime * 8;
      const scale = this.ripple.userData.scale;
      this.ripple.scale.setScalar(scale);
      this.ripple.material.opacity = Math.max(0, 0.6 * (1 - scale / this.ripple.userData.maxScale));

      if (scale >= this.ripple.userData.maxScale) {
        this.splashGroup.remove(this.ripple);
        this.ripple = null;
      } else {
        allDead = false;
      }
    }

    if (allDead && this.particles.length === 0) {
      this.active = false;
    }
  }

  clearSplash() {
    for (const particle of this.particles) {
      this.splashGroup.remove(particle);
    }
    this.particles = [];

    if (this.ripple) {
      this.splashGroup.remove(this.ripple);
      this.ripple = null;
    }
    this.active = false;
  }
}
