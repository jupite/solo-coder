import * as THREE from 'three';
import { COLORS } from '../game/constants.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 200;
  }

  createFeatherParticle(position, color) {
    const geometry = new THREE.PlaneGeometry(0.1, 0.15);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    particle.position.x += (Math.random() - 0.5) * 0.3;
    particle.position.y += (Math.random() - 0.5) * 0.3;
    particle.position.z += (Math.random() - 0.5) * 0.3;
    
    particle.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      ),
      rotationSpeed: new THREE.Vector3(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      ),
      lifetime: 1.5 + Math.random(),
      maxLifetime: 1.5 + Math.random(),
      gravity: -15
    };
    
    this.scene.add(particle);
    this.particles.push(particle);
  }

  spawnFeathers(position, colorIndex, count = 15) {
    const color = COLORS.BIRDS[colorIndex % COLORS.BIRDS.length];
    
    for (let i = 0; i < count; i++) {
      if (this.particles.length < this.maxParticles) {
        this.createFeatherParticle(position, color);
      }
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const data = particle.userData;
      
      data.velocity.y += data.gravity * delta;
      
      particle.position.add(data.velocity.clone().multiplyScalar(delta));
      
      particle.rotation.x += data.rotationSpeed.x * delta;
      particle.rotation.y += data.rotationSpeed.y * delta;
      particle.rotation.z += data.rotationSpeed.z * delta;
      
      data.lifetime -= delta;
      particle.material.opacity = (data.lifetime / data.maxLifetime) * 0.9;
      
      if (data.lifetime <= 0) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  dispose() {
    this.particles.forEach(particle => {
      this.scene.remove(particle);
      if (particle.geometry) particle.geometry.dispose();
      if (particle.material) particle.material.dispose();
    });
    this.particles = [];
  }
}
