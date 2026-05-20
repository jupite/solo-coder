import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GAME_CONFIG, COLORS } from '../config/constants.js';

export class Collectibles {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.goldItems = [];
        this.spawnProgress = 0.05;
        this.init();
    }

    init() {
        this.preSpawnGold();
    }

    preSpawnGold() {
        for (let i = 0; i < 15; i++) {
            const progress = 0.08 + i * 0.06;
            this.spawnGold(progress);
        }
    }

    spawnGold(progress) {
        const lane = Math.floor(Math.random() * 3) - 1;
        const gold = this.createGold(progress, lane);
        this.goldItems.push(gold);
    }

    createGold(progress, lane) {
        const goldGroup = new THREE.Group();
        const trackPos = this.track.getTrackPosition(progress, lane * GAME_CONFIG.LANE_WIDTH);
        const { position, tangent } = trackPos;

        goldGroup.position.copy(position);
        goldGroup.position.y = 1.2;

        const goldGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.GOLD,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0x332200,
            emissiveIntensity: 0.3,
        });
        const goldMesh = new THREE.Mesh(goldGeometry, goldMaterial);
        goldMesh.castShadow = true;
        goldGroup.add(goldMesh);

        const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            transparent: true,
            opacity: 0.2,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        goldGroup.add(glow);

        const lookAtPos = position.clone().add(tangent);
        goldGroup.lookAt(lookAtPos);

        this.scene.add(goldGroup);

        return {
            mesh: goldGroup,
            progress: progress,
            lane: lane,
            collected: false,
            rotation: 0,
            bobOffset: Math.random() * Math.PI * 2,
        };
    }

    update(playerProgress, playerLaneOffset, deltaTime) {
        let collected = 0;

        for (let i = this.goldItems.length - 1; i >= 0; i--) {
            const gold = this.goldItems[i];

            gold.rotation += deltaTime * 2;
            gold.mesh.rotation.y = gold.rotation;
            gold.mesh.position.y = 1.2 + Math.sin(Date.now() * 0.003 + gold.bobOffset) * 0.15;

            if (Math.abs(gold.progress - playerProgress) < 0.008 && !gold.collected) {
                const goldLaneOffset = gold.lane * GAME_CONFIG.LANE_WIDTH;
                if (Math.abs(goldLaneOffset - playerLaneOffset) < GAME_CONFIG.LANE_WIDTH * 0.6) {
                    collected++;
                    gold.collected = true;
                    this.removeGold(i);
                    continue;
                }
            }

            if (gold.progress < playerProgress - 0.03) {
                this.removeGold(i);
            }
        }

        if (playerProgress > this.spawnProgress) {
            this.spawnGold(this.spawnProgress + 0.6);
            this.spawnProgress += 0.06;
            if (this.spawnProgress >= 1) {
                this.spawnProgress -= 1;
            }
        }

        return collected;
    }

    removeGold(index) {
        const gold = this.goldItems[index];
        this.scene.remove(gold.mesh);
        gold.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.goldItems.splice(index, 1);
    }

    reset() {
        this.goldItems.forEach(gold => {
            this.scene.remove(gold.mesh);
            gold.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.goldItems = [];
        this.spawnProgress = 0.05;
        this.preSpawnGold();
    }

    dispose() {
        this.goldItems.forEach(gold => {
            this.scene.remove(gold.mesh);
            gold.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.goldItems = [];
    }
}
