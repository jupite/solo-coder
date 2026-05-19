import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../config/constants.js';

export class Cart {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.mesh = null;
        this.wheels = [];
        this.progress = 0;
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.lane = 0;
        this.targetLane = 0;
        this.laneOffset = 0;
        this.verticalVelocity = 0;
        this.isJumping = false;
        this.jumpHeight = 0;
        this.isOnGap = false;
        this.init();
    }

    init() {
        this.createCart();
        this.positionOnTrack(0);
    }

    createCart() {
        const cartGroup = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(
            GAME_CONFIG.CART_WIDTH,
            GAME_CONFIG.CART_HEIGHT,
            GAME_CONFIG.CART_LENGTH
        );
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.CART_BODY,
            roughness: 0.7,
            metalness: 0.3,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = GAME_CONFIG.CART_HEIGHT / 2;
        body.castShadow = true;
        cartGroup.add(body);

        const frameGeometry = new THREE.BoxGeometry(
            GAME_CONFIG.CART_WIDTH + 0.1,
            0.15,
            GAME_CONFIG.CART_LENGTH + 0.1
        );
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.CART_FRAME,
            roughness: 0.4,
            metalness: 0.7,
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.1;
        frame.castShadow = true;
        cartGroup.add(frame);

        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.CART_WHEEL,
            roughness: 0.6,
            metalness: 0.5,
        });

        const wheelPositions = [
            { x: -GAME_CONFIG.CART_WIDTH / 2 + 0.1, z: GAME_CONFIG.CART_LENGTH / 2 - 0.3 },
            { x: GAME_CONFIG.CART_WIDTH / 2 - 0.1, z: GAME_CONFIG.CART_LENGTH / 2 - 0.3 },
            { x: -GAME_CONFIG.CART_WIDTH / 2 + 0.1, z: -GAME_CONFIG.CART_LENGTH / 2 + 0.3 },
            { x: GAME_CONFIG.CART_WIDTH / 2 - 0.1, z: -GAME_CONFIG.CART_LENGTH / 2 + 0.3 },
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.2, pos.z);
            wheel.castShadow = true;
            this.wheels.push(wheel);
            cartGroup.add(wheel);
        });

        this.mesh = cartGroup;
        this.scene.add(this.mesh);
    }

    positionOnTrack(progress) {
        this.progress = progress;
        this.updatePosition();
    }

    updatePosition() {
        const trackPos = this.track.getTrackPosition(this.progress, this.laneOffset);
        const { position, tangent } = trackPos;

        this.mesh.position.copy(position);
        this.mesh.position.y += this.jumpHeight;

        const lookAtPos = position.clone().add(tangent);
        this.mesh.lookAt(lookAtPos);

        this.wheels.forEach(wheel => {
            wheel.rotation.x += this.speed * 50;
        });
    }

    moveLeft() {
        if (this.targetLane > -1 && !this.isJumping) {
            this.targetLane--;
        }
    }

    moveRight() {
        if (this.targetLane < 1 && !this.isJumping) {
            this.targetLane++;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.verticalVelocity = GAME_CONFIG.JUMP_FORCE;
            this.isJumping = true;
        }
    }

    update(deltaTime) {
        this.progress += this.speed;

        if (this.progress >= 1) {
            this.progress = 0;
        }

        const targetOffset = this.targetLane * GAME_CONFIG.LANE_WIDTH;
        this.laneOffset += (targetOffset - this.laneOffset) * 0.2;

        if (this.isJumping) {
            this.jumpHeight += this.verticalVelocity;
            this.verticalVelocity -= GAME_CONFIG.GRAVITY;

            if (this.jumpHeight <= 0) {
                this.jumpHeight = 0;
                this.verticalVelocity = 0;
                this.isJumping = false;
            }
        }

        if (this.speed < GAME_CONFIG.MAX_SPEED) {
            this.speed += GAME_CONFIG.SPEED_INCREMENT;
        }

        this.updatePosition();
    }

    slowDown() {
        this.speed = Math.max(this.speed * 0.7, GAME_CONFIG.INITIAL_SPEED * 0.5);
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    getForwardDirection() {
        const direction = new THREE.Vector3();
        this.mesh.getWorldDirection(direction);
        return direction;
    }

    getBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.mesh);
        return box;
    }

    isInAir() {
        return this.isJumping;
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
