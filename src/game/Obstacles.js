import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GAME_CONFIG, COLORS, OBSTACLE_TYPES } from '../config/constants.js';

export class Obstacles {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.obstacles = [];
        this.spawnProgress = 0.1;
        this.init();
    }

    init() {
        this.preSpawnObstacles();
    }

    preSpawnObstacles() {
        for (let i = 0; i < 5; i++) {
            const progress = 0.2 + i * 0.15;
            this.spawnObstacle(progress);
        }
    }

    spawnObstacle(progress) {
        const types = Object.values(OBSTACLE_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const obstacle = this.createObstacle(type, progress);
        this.obstacles.push(obstacle);
    }

    createObstacle(type, progress) {
        const obstacleGroup = new THREE.Group();
        let hitbox = null;
        const trackPos = this.track.getTrackPosition(progress, 0);
        const { position, tangent, normal } = trackPos;

        obstacleGroup.position.copy(position);

        switch (type) {
            case OBSTACLE_TYPES.BEAM:
                hitbox = this.createBeam(obstacleGroup, tangent, normal);
                break;
            case OBSTACLE_TYPES.LEFT_BLOCK:
                hitbox = this.createSideBlock(obstacleGroup, tangent, normal, 'left');
                break;
            case OBSTACLE_TYPES.RIGHT_BLOCK:
                hitbox = this.createSideBlock(obstacleGroup, tangent, normal, 'right');
                break;
            case OBSTACLE_TYPES.GAP:
                hitbox = this.createGap(obstacleGroup, tangent, normal);
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

    createBeam(group, tangent, normal) {
        const beamGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.9, 0.3, 0.3);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.OBSTACLE_BEAM,
            roughness: 0.7,
            metalness: 0.3,
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.y = 1.4;
        beam.castShadow = true;
        group.add(beam);

        const supportGeometry = new THREE.BoxGeometry(0.15, 1.8, 0.15);
        const supportMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.6,
            metalness: 0.5,
        });

        const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        leftSupport.position.set(-GAME_CONFIG.TRACK_WIDTH * 0.45, 0.9, 0);
        leftSupport.castShadow = true;
        group.add(leftSupport);

        const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        rightSupport.position.set(GAME_CONFIG.TRACK_WIDTH * 0.45, 0.9, 0);
        rightSupport.castShadow = true;
        group.add(rightSupport);

        const hitboxGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.85, 0.4, 0.4);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.y = 1.4;
        group.add(hitbox);

        return hitbox;
    }

    createSideBlock(group, tangent, normal, side) {
        const blockGeometry = new THREE.BoxGeometry(1, 1.5, 1);
        const blockMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.OBSTACLE_SIDE,
            roughness: 0.8,
            metalness: 0.1,
        });
        const block = new THREE.Mesh(blockGeometry, blockMaterial);

        const offset = side === 'left' ? -1 : 1;
        block.position.x = offset * GAME_CONFIG.LANE_WIDTH;
        block.position.y = 0.75;
        block.castShadow = true;
        group.add(block);

        const spikeGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.4,
            metalness: 0.7,
        });

        for (let i = 0; i < 2; i++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(
                offset * GAME_CONFIG.LANE_WIDTH,
                0.3 + i * 0.6,
                0
            );
            spike.rotation.z = offset * Math.PI / 2;
            spike.castShadow = true;
            group.add(spike);
        }

        const hitboxGeometry = new THREE.BoxGeometry(1.1, 1.6, 1.1);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.set(offset * GAME_CONFIG.LANE_WIDTH, 0.75, 0);
        group.add(hitbox);

        return hitbox;
    }

    createGap(group, tangent, normal) {
        const gapGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.9, 0.1, 3);
        const gapMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
        });
        const gap = new THREE.Mesh(gapGeometry, gapMaterial);
        gap.position.y = -0.1;
        group.add(gap);

        const warningGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.3);
        const warningMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4400,
            emissive: 0xff2200,
            emissiveIntensity: 0.5,
        });

        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                const warning = new THREE.Mesh(warningGeometry, warningMaterial);
                warning.position.set(
                    i * GAME_CONFIG.TRACK_WIDTH * 0.45,
                    0.15,
                    j * 1.2
                );
                group.add(warning);
            }
        }

        const hitboxGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.85, 0.5, 2.8);
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.y = -0.25;
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

            if (Math.abs(obstacle.progress - playerProgress) < 0.008 && !obstacle.passed) {
                const hits = this.checkCollision(obstacle, playerLane, playerHeight, isJumping, isCrouching);
                if (hits) {
                    collision = true;
                    hitType = obstacle.type;
                    obstacle.passed = true;
                    this.removeObstacle(i);
                    continue;
                }
            }

            if (obstacle.progress < playerProgress - 0.05) {
                this.removeObstacle(i);
            }
        }

        if (playerProgress > this.spawnProgress) {
            this.spawnObstacle(this.spawnProgress + 0.6);
            this.spawnProgress += 0.12;
            if (this.spawnProgress >= 1) {
                this.spawnProgress -= 1;
            }
        }

        return { collision, hitType };
    }

    checkCollision(obstacle, playerLane, playerHeight, isJumping, isCrouching) {
        switch (obstacle.type) {
            case OBSTACLE_TYPES.BEAM:
                return playerHeight > 1.2 && !isCrouching;
            case OBSTACLE_TYPES.LEFT_BLOCK:
                return playerLane < 0;
            case OBSTACLE_TYPES.RIGHT_BLOCK:
                return playerLane > 0;
            case OBSTACLE_TYPES.GAP:
                return !isJumping;
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
        this.spawnProgress = 0.1;
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
