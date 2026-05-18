import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/constants.js';
import { randomRange } from '../utils/helpers.js';

export class ParticleSystem {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.particles = null;
        this.positions = null;
        this.velocities = null;
        this.particleCount = GAME_CONFIG.SNOW_PARTICLE_COUNT;
        
        this.init();
    }
    
    init() {
        const geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        
        for (let i = 0; i < this.particleCount; i++) {
            this.resetParticle(i);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: GAME_CONFIG.SNOW_PARTICLE_SIZE,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.sceneManager.add(this.particles);
    }
    
    resetParticle(index) {
        const i = index * 3;
        this.positions[i] = randomRange(-100, 100);
        this.positions[i + 1] = randomRange(10, 100);
        this.positions[i + 2] = randomRange(-200, 100);
        
        this.velocities[i] = randomRange(-0.5, 0.5);
        this.velocities[i + 1] = randomRange(-2, -0.5);
        this.velocities[i + 2] = randomRange(0, 1);
    }
    
    update(deltaTime, playerPosition, playerSpeed) {
        const speedFactor = playerSpeed / GAME_CONFIG.PLAYER_SPEED_MAX;
        const windEffect = speedFactor * 5;
        
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            
            this.positions[idx] += (this.velocities[idx] - windEffect * 0.3) * deltaTime * 30;
            this.positions[idx + 1] += this.velocities[idx + 1] * deltaTime * 30;
            this.positions[idx + 2] += this.velocities[idx + 2] * deltaTime * 30 + speedFactor * deltaTime * 50;
            
            if (this.positions[idx + 1] < 0 || 
                this.positions[idx] < playerPosition.x - 100 ||
                this.positions[idx] > playerPosition.x + 100 ||
                this.positions[idx + 2] > playerPosition.z + 100) {
                this.positions[idx] = playerPosition.x + randomRange(-100, 100);
                this.positions[idx + 1] = randomRange(50, 100);
                this.positions[idx + 2] = playerPosition.z - randomRange(50, 200);
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    reset() {
        for (let i = 0; i < this.particleCount; i++) {
            this.resetParticle(i);
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
