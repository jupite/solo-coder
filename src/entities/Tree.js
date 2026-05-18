import * as THREE from 'three';
import { COLORS, GAME_CONFIG } from '../utils/constants.js';
import { randomRange } from '../utils/helpers.js';

export class Tree {
    constructor() {
        this.mesh = null;
        this.hitRadius = GAME_CONFIG.TREE_HIT_RADIUS;
        this.createMesh();
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        const trunkHeight = randomRange(3, 6);
        const trunkRadius = randomRange(0.3, 0.6);
        const trunkGeometry = new THREE.CylinderGeometry(
            trunkRadius * 0.7,
            trunkRadius,
            trunkHeight,
            8
        );
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.TREE_TRUNK,
            flatShading: true,
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        const layers = randomRange(2, 4);
        const baseRadius = randomRange(2, 3.5);
        
        for (let i = 0; i < layers; i++) {
            const layerHeight = baseRadius * 0.8;
            const layerRadius = baseRadius * (1 - i * 0.2);
            const layerGeometry = new THREE.ConeGeometry(
                layerRadius,
                layerHeight,
                8
            );
            const layerMaterial = new THREE.MeshStandardMaterial({
                color: COLORS.TREE_LEAVES,
                flatShading: true,
            });
            const layer = new THREE.Mesh(layerGeometry, layerMaterial);
            layer.position.y = trunkHeight + i * layerHeight * 0.6 + layerHeight / 2;
            layer.castShadow = true;
            layer.receiveShadow = true;
            group.add(layer);
        }
        
        this.mesh = group;
    }
    
    setPosition(x, z) {
        this.mesh.position.set(x, 0, z);
    }
    
    getPosition() {
        return this.mesh.position;
    }
    
    getHitRadius() {
        return this.hitRadius;
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
