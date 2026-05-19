import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../config/constants.js';

export class Player {
    constructor(scene, cart) {
        this.scene = scene;
        this.cart = cart;
        this.mesh = null;
        this.body = null;
        this.head = null;
        this.isCrouching = false;
        this.currentHeight = GAME_CONFIG.PLAYER_HEIGHT;
        this.targetHeight = GAME_CONFIG.PLAYER_HEIGHT;
        this.init();
    }

    init() {
        this.createPlayer();
    }

    createPlayer() {
        const playerGroup = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(0.6, GAME_CONFIG.PLAYER_HEIGHT * 0.6, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_BODY,
            roughness: 0.7,
            metalness: 0.1,
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = GAME_CONFIG.PLAYER_HEIGHT * 0.3 + GAME_CONFIG.CART_HEIGHT;
        this.body.castShadow = true;
        playerGroup.add(this.body);

        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_HEAD,
            roughness: 0.8,
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = GAME_CONFIG.PLAYER_HEIGHT * 0.6 + 0.25 + GAME_CONFIG.CART_HEIGHT;
        this.head.castShadow = true;
        playerGroup.add(this.head);

        const helmetGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const helmetMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_HELMET,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0x332200,
            emissiveIntensity: 0.3,
        });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = GAME_CONFIG.PLAYER_HEIGHT * 0.6 + 0.28 + GAME_CONFIG.CART_HEIGHT;
        helmet.castShadow = true;
        playerGroup.add(helmet);
        this.helmet = helmet;

        const lampGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const lampMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(0, GAME_CONFIG.PLAYER_HEIGHT * 0.6 + 0.4 + GAME_CONFIG.CART_HEIGHT, 0.2);
        playerGroup.add(lamp);

        const pointLight = new THREE.PointLight(0xffffcc, 0.5, 15);
        pointLight.position.set(0, GAME_CONFIG.PLAYER_HEIGHT * 0.6 + 0.5 + GAME_CONFIG.CART_HEIGHT, 0.5);
        pointLight.castShadow = true;
        playerGroup.add(pointLight);

        const leftArmGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const leftArmMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_BODY,
            roughness: 0.7,
        });
        const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
        leftArm.position.set(-0.4, GAME_CONFIG.PLAYER_HEIGHT * 0.4 + GAME_CONFIG.CART_HEIGHT, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        playerGroup.add(leftArm);

        const rightArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
        rightArm.position.set(0.4, GAME_CONFIG.PLAYER_HEIGHT * 0.4 + GAME_CONFIG.CART_HEIGHT, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        playerGroup.add(rightArm);

        this.mesh = playerGroup;
        this.cart.mesh.add(this.mesh);
    }

    crouch(state) {
        this.isCrouching = state;
        this.targetHeight = state ? GAME_CONFIG.PLAYER_CROUCH_HEIGHT : GAME_CONFIG.PLAYER_HEIGHT;
    }

    update(deltaTime) {
        this.currentHeight += (this.targetHeight - this.currentHeight) * 0.15;

        const heightRatio = this.currentHeight / GAME_CONFIG.PLAYER_HEIGHT;

        this.body.scale.y = heightRatio;
        this.body.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.3) * heightRatio;

        this.head.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.6) * heightRatio + 0.25;
        this.helmet.position.y = GAME_CONFIG.CART_HEIGHT + (GAME_CONFIG.PLAYER_HEIGHT * 0.6) * heightRatio + 0.28;
    }

    getEffectiveHeight() {
        return this.currentHeight + GAME_CONFIG.CART_HEIGHT;
    }

    getBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.mesh);
        return box;
    }

    dispose() {
        this.cart.mesh.remove(this.mesh);
        this.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
