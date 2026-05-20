import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GAME_CONFIG, COLORS } from '../config/constants.js';

export class Player {
    constructor(scene, cart) {
        this.scene = scene;
        this.cart = cart;
        this.mesh = null;
        this.body = null;
        this.head = null;
        this.helmet = null;
        
        this.isCrouching = false;
        this.currentHeight = GAME_CONFIG.PLAYER_HEIGHT;
        this.targetHeight = GAME_CONFIG.PLAYER_HEIGHT;
        
        this.currentLane = 0;
        this.targetLane = 0;
        this.lateralOffset = 0;
        this.leanAngle = 0;
        this.targetLeanAngle = 0;
        
        this.init();
    }

    init() {
        this.createPlayer();
    }

    createPlayer() {
        const playerGroup = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(0.5, GAME_CONFIG.PLAYER_HEIGHT * 0.55, 0.35);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_BODY,
            roughness: 0.7,
            metalness: 0.1,
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = GAME_CONFIG.PLAYER_HEIGHT * 0.275 + GAME_CONFIG.CART_HEIGHT;
        this.body.castShadow = true;
        playerGroup.add(this.body);

        const headGeometry = new THREE.SphereGeometry(0.22, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_HEAD,
            roughness: 0.8,
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = GAME_CONFIG.PLAYER_HEIGHT * 0.55 + 0.22 + GAME_CONFIG.CART_HEIGHT;
        this.head.castShadow = true;
        playerGroup.add(this.head);

        const helmetGeometry = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const helmetMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_HELMET,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0x332200,
            emissiveIntensity: 0.3,
        });
        this.helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        this.helmet.position.y = GAME_CONFIG.PLAYER_HEIGHT * 0.55 + 0.25 + GAME_CONFIG.CART_HEIGHT;
        this.helmet.castShadow = true;
        playerGroup.add(this.helmet);

        const lampGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const lampMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(0, GAME_CONFIG.PLAYER_HEIGHT * 0.55 + 0.38 + GAME_CONFIG.CART_HEIGHT, 0.18);
        playerGroup.add(lamp);

        const pointLight = new THREE.PointLight(0xffffcc, 0.4, 12);
        pointLight.position.set(0, GAME_CONFIG.PLAYER_HEIGHT * 0.55 + 0.45 + GAME_CONFIG.CART_HEIGHT, 0.4);
        pointLight.castShadow = true;
        playerGroup.add(pointLight);

        const leftArmGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8);
        const leftArmMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_BODY,
            roughness: 0.7,
        });
        this.leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
        this.leftArm.position.set(-0.35, GAME_CONFIG.PLAYER_HEIGHT * 0.35 + GAME_CONFIG.CART_HEIGHT, 0);
        this.leftArm.rotation.z = 0.2;
        this.leftArm.castShadow = true;
        playerGroup.add(this.leftArm);

        this.rightArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
        this.rightArm.position.set(0.35, GAME_CONFIG.PLAYER_HEIGHT * 0.35 + GAME_CONFIG.CART_HEIGHT, 0);
        this.rightArm.rotation.z = -0.2;
        this.rightArm.castShadow = true;
        playerGroup.add(this.rightArm);

        this.mesh = playerGroup;
        this.cart.mesh.add(this.mesh);
    }

    leanLeft() {
        if (this.targetLane > -1 && !this.isCrouching) {
            this.targetLane = -1;
            this.targetLeanAngle = 0.3;
        }
    }

    leanRight() {
        if (this.targetLane < 1 && !this.isCrouching) {
            this.targetLane = 1;
            this.targetLeanAngle = -0.3;
        }
    }

    crouch(state) {
        this.isCrouching = state;
        if (state) {
            this.targetHeight = 0;
            this.targetLane = 0;
            this.targetLeanAngle = 0;
            if (this.mesh) {
                this.mesh.visible = false;
            }
        } else {
            this.targetHeight = GAME_CONFIG.PLAYER_HEIGHT;
            if (this.mesh) {
                this.mesh.visible = true;
            }
        }
    }

    getCurrentLane() {
        return this.targetLane;
    }

    update(deltaTime) {
        this.currentHeight += (this.targetHeight - this.currentHeight) * 0.15;
        this.leanAngle += (this.targetLeanAngle - this.leanAngle) * 0.15;
        this.lateralOffset += (this.targetLane * GAME_CONFIG.LANE_WIDTH * 0.5 - this.lateralOffset) * 0.15;

        const heightRatio = this.currentHeight / GAME_CONFIG.PLAYER_HEIGHT;

        this.body.scale.y = heightRatio;
        this.body.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.275) * heightRatio;
        this.body.position.x = this.lateralOffset;
        this.body.rotation.z = this.leanAngle;

        this.head.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.55) * heightRatio + 0.22;
        this.head.position.x = this.lateralOffset;
        this.head.rotation.z = this.leanAngle * 0.5;

        this.helmet.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.55) * heightRatio + 0.25;
        this.helmet.position.x = this.lateralOffset;
        this.helmet.rotation.z = this.leanAngle * 0.5;

        this.leftArm.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.35) * heightRatio;
        this.leftArm.position.x = this.lateralOffset - 0.35;
        this.leftArm.rotation.z = 0.2 + this.leanAngle;

        this.rightArm.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.35) * heightRatio;
        this.rightArm.position.x = this.lateralOffset + 0.35;
        this.rightArm.rotation.z = -0.2 + this.leanAngle;
    }

    getEffectiveHeight() {
        return this.currentHeight + GAME_CONFIG.CART_HEIGHT;
    }

    getBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.mesh);
        return box;
    }

    dispose() {
        if (this.cart && this.cart.mesh && this.mesh) {
            this.cart.mesh.remove(this.mesh);
        }
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}
