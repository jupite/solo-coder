import * as THREE from 'three';
import { GAME_CONFIG } from '../config/config.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  emit(position, color) {
    const particleGroup = new THREE.Group();
    const particleData = [];

    for (let i = 0; i < GAME_CONFIG.PARTICLES.count; i++) {
      const geometry = new THREE.SphereGeometry(GAME_CONFIG.PARTICLES.size, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(geometry, material);

      const angle = (Math.PI * 2 * i) / GAME_CONFIG.PARTICLES.count;
      const speed = GAME_CONFIG.PARTICLES.speed * (0.5 + Math.random() * 0.5);

      particle.userData = {
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * speed
        ),
        life: GAME_CONFIG.PARTICLES.life,
        maxLife: GAME_CONFIG.PARTICLES.life
      };

      particle.position.copy(position);
      particleGroup.add(particle);
      particleData.push(particle);
    }

    this.scene.add(particleGroup);
    this.particles.push({
      group: particleGroup,
      particles: particleData,
      life: GAME_CONFIG.PARTICLES.life
    });
  }

  update(delta) {
    this.particles = this.particles.filter((particleSystem) => {
      particleSystem.life -= delta;

      particleSystem.particles.forEach((particle) => {
        particle.userData.life -= delta;
        particle.userData.velocity.y -= 9.8 * delta;

        particle.position.x += particle.userData.velocity.x * delta;
        particle.position.y += particle.userData.velocity.y * delta;
        particle.position.z += particle.userData.velocity.z * delta;

        particle.material.opacity = Math.max(0, particle.userData.life / particle.userData.maxLife);
        particle.scale.setScalar(0.5 + particle.userData.life / particle.userData.maxLife);
      });

      if (particleSystem.life <= 0) {
        this.scene.remove(particleSystem.group);
        return false;
      }
      return true;
    });
  }
}
