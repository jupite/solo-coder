import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class Player {
    constructor() {
        this.mesh = null;
        this.speed = GAME_CONFIG.PLAYER_SPEED_INITIAL;
        this.horizontalSpeed = GAME_CONFIG.PLAYER_HORIZONTAL_SPEED;
        this.isColliding = false;
        this.collisionCooldown = 0;
        
        this.createMesh();
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        const bodyGeometry = new THREE.ConeGeometry(0.8, 2.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER,
            flatShading: true,
            metalness: 0.3,
            roughness: 0.7,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.25;
        body.castShadow = true;
        group.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffe4c4,
            flatShading: true,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.8;
        head.castShadow = true;
        group.add(head);
        
        const hatGeometry = new THREE.ConeGeometry(0.6, 0.8, 8);
        const hatMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            flatShading: true,
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 3.4;
        hat.castShadow = true;
        group.add(hat);
        
        const skiGeometry = new THREE.BoxGeometry(0.2, 0.1, 3);
        const skiMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2,
        });
        
        const leftSki = new THREE.Mesh(skiGeometry, skiMaterial);
        leftSki.position.set(-0.4, 0.05, 0);
        leftSki.castShadow = true;
        group.add(leftSki);
        
        const rightSki = new THREE.Mesh(skiGeometry, skiMaterial);
        rightSki.position.set(0.4, 0.05, 0);
        rightSki.castShadow = true;
        group.add(rightSki);
        
        this.mesh = group;
        this.mesh.position.set(0, 0, 0);
    }
    
    update(deltaTime, inputAxis, trackWidth) {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime;
            if (this.collisionCooldown <= 0) {
                this.isColliding = false;
            }
        }
        
        if (!this.isColliding) {
            this.speed = Math.min(
                this.speed + GAME_CONFIG.PLAYER_SPEED_ACCELERATION * deltaTime,
                GAME_CONFIG.PLAYER_SPEED_MAX
            );
        }
        
        const moveX = inputAxis * this.horizontalSpeed * deltaTime;
        this.mesh.position.x += moveX;
        
        const halfWidth = trackWidth / 2 - 2;
        this.mesh.position.x = clamp(this.mesh.position.x, -halfWidth, halfWidth);
        
        this.mesh.position.z -= this.speed * deltaTime;
        
        const tiltAmount = inputAxis * 0.3;
        this.mesh.rotation.z = THREE.MathUtils.lerp(
            this.mesh.rotation.z,
            tiltAmount,
            deltaTime * 8
        );
        
        const bobbing = Math.sin(Date.now() * 0.01) * 0.05;
        this.mesh.position.y = bobbing;
    }
    
    onCollision() {
        if (this.isColliding) return;
        
        this.isColliding = true;
        this.collisionCooldown = 1;
        this.speed *= GAME_CONFIG.COLLISION_SPEED_REDUCTION;
        
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissive = new THREE.Color(0xff0000);
                child.material.emissiveIntensity = 0.5;
                setTimeout(() => {
                    if (child.material) {
                        child.material.emissiveIntensity = 0;
                    }
                }, 200);
            }
        });
    }
    
    getPosition() {
        return this.mesh.position;
    }
    
    getHitRadius() {
        return GAME_CONFIG.PLAYER_HIT_RADIUS;
    }
    
    getSpeed() {
        return this.speed;
    }
    
    reset() {
        this.mesh.position.set(0, 0, 0);
        this.speed = GAME_CONFIG.PLAYER_SPEED_INITIAL;
        this.isColliding = false;
        this.collisionCooldown = 0;
    }
}
