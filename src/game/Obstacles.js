import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GAME_CONFIG, COLORS, OBSTACLE_TYPES } from '../config/constants.js';

export class Obstacles {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.obstacles = [];
        this.spawnProgress = 0.15;
        this.init();
    }

    init() {
        this.preSpawnObstacles();
    }

    preSpawnObstacles() {
        for (let i = 0; i < 4; i++) {
            const progress = 0.2 + i * 0.18;
            this.spawnObstacle(progress);
        }
    }

    spawnObstacle(progress) {
    }

    createObstacle(type, progress) {
        const obstacleGroup = new THREE.Group();
        let hitbox = null;
        const trackPos = this.track.getTrackPosition(progress, 0);
        const { position, tangent, normal } = trackPos;

        obstacleGroup.position.copy(position);

        switch (type) {
            case OBSTACLE_TYPES.BEAM:
                hitbox = this.createOverheadBeam(obstacleGroup, tangent, normal);
                break;
            case OBSTACLE_TYPES.LEFT_BLOCK:
                hitbox = this.createSideObstacle(obstacleGroup, tangent, normal, 'left');
                break;
            case OBSTACLE_TYPES.RIGHT_BLOCK:
                hitbox = this.createSideObstacle(obstacleGroup, tangent, normal, 'right');
                break;
        }

        const lookAtPos = position.clone().add(tangent);
        obstacleGroup.lookAt(lookAtPos);

        this.scene.add(obstacleGroup);

        return {
            mesh: obstacleGroup,
            hitbox: hitbox,
            type: type,
            progress: progress,
            passed: false,
        };
    }

    createOverheadBeam(group, tangent, normal) {
        const beamGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.9, 0.3, 0.3);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.OBSTACLE_BEAM,
            roughness: 0.7,
            metalness: 0.3,
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.y = 1.3;
        beam.castShadow = true;
        group.add(beam);

        const supportGeometry = new THREE.BoxGeometry(0.12, 1.5, 0.12);
        const supportMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.6,
            metalness: 0.5,
        });

        const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        leftSupport.position.set(-GAME_CONFIG.TRACK_WIDTH * 0.45, 0.75, 0);
        leftSupport.castShadow = true;
        group.add(leftSupport);

        const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        rightSupport.position.set(GAME_CONFIG.TRACK_WIDTH * 0.45, 0.75, 0);
        rightSupport.castShadow = true;
        group.add(rightSupport);

        const hitboxGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.85, 0.35, 0.35);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.y = 1.3;
        group.add(hitbox);

        return hitbox;
    }

    createSideObstacle(group, tangent, normal, side) {
        const offset = side === 'left' ? -1 : 1;
        
        const baseGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.OBSTACLE_SIDE,
            roughness: 0.8,
            metalness: 0.1,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(offset * (GAME_CONFIG.TRACK_WIDTH * 0.55), 0.6, 0);
        base.castShadow = true;
        group.add(base);

        const extensionGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.6);
        const extensionMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a0000,
            roughness: 0.7,
            metalness: 0.2,
        });
        const extension = new THREE.Mesh(extensionGeometry, extensionMaterial);
        extension.position.set(offset * (GAME_CONFIG.TRACK_WIDTH * 0.35), 0.9, 0);
        extension.castShadow = true;
        group.add(extension);

        const spikeGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.4,
            metalness: 0.7,
        });

        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(offset * (GAME_CONFIG.TRACK_WIDTH * 0.28), 0.9, 0);
        spike.rotation.z = -offset * Math.PI / 2;
        spike.castShadow = true;
        group.add(spike);

        const hitboxGeometry = new THREE.BoxGeometry(0.6, 0.7, 0.7);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.set(offset * (GAME_CONFIG.TRACK_WIDTH * 0.35), 0.9, 0);
        group.add(hitbox);

        return hitbox;
    }

    update(playerProgress, playerLane, playerHeight, isJumping, isCrouching) {
        let collision = false;
        let hitType = null;

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];

            if (obstacle.progress < playerProgress - 0.01) {
                if (!obstacle.passed) {
                    obstacle.passed = true;
                }
            }

            if (Math.abs(obstacle.progress - playerProgress) < 0.006 && !obstacle.passed) {
                const hits = this.checkCollision(obstacle, playerLane, playerHeight, isJumping, isCrouching);
                if (hits) {
                    collision = true;
                    hitType = obstacle.type;
                    obstacle.passed = true;
                    this.removeObstacle(i);
                    continue;
                }
            }

            if (obstacle.progress < playerProgress - 0.04) {
                this.removeObstacle(i);
            }
        }

        if (playerProgress > this.spawnProgress) {
            this.spawnObstacle((this.spawnProgress + 0.5) % 1);
            this.spawnProgress += 0.15;
            if (this.spawnProgress >= 1) {
                this.spawnProgress -= 1;
            }
        }

        return { collision, hitType };
    }

    checkCollision(obstacle, playerLane, playerHeight, isJumping, isCrouching) {
        switch (obstacle.type) {
            case OBSTACLE_TYPES.BEAM:
                return playerHeight > 1.1 && !isCrouching;
            case OBSTACLE_TYPES.LEFT_BLOCK:
                return playerLane < 0;
            case OBSTACLE_TYPES.RIGHT_BLOCK:
                return playerLane > 0;
            default:
                return false;
        }
    }

    removeObstacle(index) {
        const obstacle = this.obstacles[index];
        this.scene.remove(obstacle.mesh);
        obstacle.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.obstacles.splice(index, 1);
    }

    reset() {
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle.mesh);
            obstacle.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.obstacles = [];
        this.spawnProgress = 0.15;
        this.preSpawnObstacles();
    }

    dispose() {
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle.mesh);
            obstacle.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.obstacles = [];
    }
}
