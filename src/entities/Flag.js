import * as THREE from 'three';
import { COLORS, GAME_CONFIG } from '../utils/constants.js';
import { randomChoice } from '../utils/helpers.js';

export class Flag {
    constructor() {
        this.mesh = null;
        this.collected = false;
        this.collectRadius = GAME_CONFIG.FLAG_COLLECT_RADIUS;
        this.color = null;
        
        this.createMesh();
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            metalness: 0.3,
            roughness: 0.7,
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2;
        pole.castShadow = true;
        group.add(pole);
        
        this.color = randomChoice(COLORS.FLAG_COLORS);
        const flagGeometry = new THREE.PlaneGeometry(2, 1.2);
        const flagMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            side: THREE.DoubleSide,
            flatShading: true,
        });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(1, 3.2, 0);
        flag.castShadow = true;
        group.add(flag);
        
        this.mesh = group;
        this.flagMesh = flag;
    }
    
    setPosition(x, z) {
        this.mesh.position.set(x, 0, z);
        this.collected = false;
        this.mesh.visible = true;
    }
    
    update(deltaTime) {
        if (this.flagMesh) {
            const wave = Math.sin(Date.now() * 0.005 + this.mesh.position.z) * 0.2;
            this.flagMesh.rotation.y = wave;
        }
    }
    
    collect() {
        if (this.collected) return false;
        
        this.collected = true;
        this.mesh.visible = false;
        return true;
    }
    
    getPosition() {
        return this.mesh.position;
    }
    
    getCollectRadius() {
        return this.collectRadius;
    }
    
    isCollected() {
        return this.collected;
    }
    
    dispose() {
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
    }
}
