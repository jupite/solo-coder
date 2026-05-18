import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Car {
    constructor(scene, color, isPlayer = false) {
        this.scene = scene;
        this.color = color;
        this.isPlayer = isPlayer;
        this.group = new THREE.Group();
        
        this.speed = 0;
        this.maxSpeed = CONFIG.CAR.MAX_SPEED;
        this.acceleration = CONFIG.CAR.ACCELERATION;
        this.deceleration = CONFIG.CAR.DECELERATION;
        this.turnSpeed = CONFIG.CAR.TURN_SPEED;
        this.friction = CONFIG.CAR.FRICTION;
        
        this.steerInput = 0;
        this.accelInput = 0;
        this.brakeInput = 0;
        
        this.currentWaypoint = 0;
        this.lap = 1;
        this.checkpointPassed = false;
        this.raceProgress = 0;
        
        this.isBoosting = false;
        this.boostEndTime = 0;
        this.boostMultiplier = 1;
        
        this.flashWhite = false;
        this.flashEndTime = 0;
        
        this.wheels = [];
        this.originalMaterials = [];
        
        this.init();
    }

    init() {
        this.createCarBody();
        this.createWheels();
        this.scene.add(this.group);
    }

    createCarBody() {
        const { WIDTH, LENGTH, HEIGHT } = CONFIG.CAR;
        
        const bodyGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT * 0.6, LENGTH);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.5,
            metalness: 0.3,
        });
        this.originalMaterials.push(bodyMaterial);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = HEIGHT * 0.3;
        body.castShadow = true;
        this.group.add(body);
        
        const cabinGeometry = new THREE.BoxGeometry(WIDTH * 0.8, HEIGHT * 0.5, LENGTH * 0.5);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7,
        });
        this.originalMaterials.push(cabinMaterial);
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, HEIGHT * 0.85, -LENGTH * 0.1);
        cabin.castShadow = true;
        this.group.add(cabin);
        
        const noseGeometry = new THREE.BoxGeometry(WIDTH * 0.9, HEIGHT * 0.4, LENGTH * 0.3);
        const noseMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.5,
            metalness: 0.3,
        });
        this.originalMaterials.push(noseMaterial);
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, HEIGHT * 0.2, LENGTH * 0.55);
        nose.castShadow = true;
        this.group.add(nose);
        
        const spoilerGeometry = new THREE.BoxGeometry(WIDTH * 0.9, HEIGHT * 0.1, LENGTH * 0.1);
        const spoilerMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.8,
        });
        const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
        spoiler.position.set(0, HEIGHT * 1.1, -LENGTH * 0.45);
        spoiler.castShadow = true;
        this.group.add(spoiler);
        
        const spoilerSupportGeometry = new THREE.BoxGeometry(WIDTH * 0.05, HEIGHT * 0.3, LENGTH * 0.05);
        const spoilerSupportMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.8,
        });
        const leftSupport = new THREE.Mesh(spoilerSupportGeometry, spoilerSupportMaterial);
        leftSupport.position.set(-WIDTH * 0.35, HEIGHT * 0.95, -LENGTH * 0.45);
        leftSupport.castShadow = true;
        this.group.add(leftSupport);
        
        const rightSupport = new THREE.Mesh(spoilerSupportGeometry, spoilerSupportMaterial);
        rightSupport.position.set(WIDTH * 0.35, HEIGHT * 0.95, -LENGTH * 0.45);
        rightSupport.castShadow = true;
        this.group.add(rightSupport);
        
        const headlightGeometry = new THREE.BoxGeometry(WIDTH * 0.2, HEIGHT * 0.1, LENGTH * 0.05);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffaa,
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
        });
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-WIDTH * 0.3, HEIGHT * 0.25, LENGTH * 0.7);
        this.group.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(WIDTH * 0.3, HEIGHT * 0.25, LENGTH * 0.7);
        this.group.add(rightHeadlight);
        
        const taillightGeometry = new THREE.BoxGeometry(WIDTH * 0.2, HEIGHT * 0.1, LENGTH * 0.05);
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.3,
        });
        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-WIDTH * 0.3, HEIGHT * 0.25, -LENGTH * 0.7);
        this.group.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(WIDTH * 0.3, HEIGHT * 0.25, -LENGTH * 0.7);
        this.group.add(rightTaillight);
    }

    createWheels() {
        const { WIDTH, LENGTH, HEIGHT } = CONFIG.CAR;
        const wheelRadius = HEIGHT * 0.4;
        const wheelWidth = WIDTH * 0.3;
        
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 12);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
        });
        
        const wheelPositions = [
            [-WIDTH * 0.6, wheelRadius, LENGTH * 0.4],
            [WIDTH * 0.6, wheelRadius, LENGTH * 0.4],
            [-WIDTH * 0.6, wheelRadius, -LENGTH * 0.4],
            [WIDTH * 0.6, wheelRadius, -LENGTH * 0.4],
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.castShadow = true;
            this.group.add(wheel);
            this.wheels.push(wheel);
        });
    }

    update(deltaTime, track) {
        this.updateBoost();
        this.updateFlash();
        
        const currentMaxSpeed = this.maxSpeed * this.boostMultiplier;
        
        if (this.accelInput > 0) {
            this.speed += this.acceleration * this.accelInput * deltaTime * this.boostMultiplier;
        } else if (this.brakeInput > 0) {
            this.speed -= CONFIG.CAR.BRAKE_FORCE * this.brakeInput * deltaTime;
        } else {
            if (this.speed > 0) {
                this.speed -= this.deceleration * deltaTime;
            } else if (this.speed < 0) {
                this.speed += this.deceleration * deltaTime;
            }
        }
        
        this.speed = Math.max(-currentMaxSpeed * 0.3, Math.min(currentMaxSpeed, this.speed));
        this.speed *= this.friction;
        
        const speedFactor = Math.min(Math.abs(this.speed) / currentMaxSpeed, 1);
        this.group.rotation.y += this.steerInput * this.turnSpeed * speedFactor * deltaTime;
        
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.group.quaternion);
        this.group.position.add(forward.multiplyScalar(this.speed * deltaTime));
        
        this.group.position.y = CONFIG.CAR.HEIGHT / 2;
        
        this.wheels.forEach(wheel => {
            wheel.rotation.x += this.speed * deltaTime * 2;
        });
        
        if (track) {
            this.updateRaceProgress(track);
        }
    }

    updateRaceProgress(track) {
        const nearest = track.getNearestWaypoint(this.group.position);
        const waypoint = track.getWaypoint(nearest);
        const nextWaypoint = track.getWaypoint(nearest + 1);
        
        const toNext = new THREE.Vector3().subVectors(nextWaypoint, waypoint);
        const toCar = new THREE.Vector3().subVectors(this.group.position, waypoint);
        const progress = toCar.dot(toNext.normalize()) / toNext.length();
        
        this.raceProgress = (nearest + Math.max(0, Math.min(1, progress))) / track.waypoints.length;
        
        if (nearest > this.currentWaypoint + track.waypoints.length / 2) {
            this.currentWaypoint = nearest - track.waypoints.length;
        } else if (nearest < this.currentWaypoint - track.waypoints.length / 2) {
            this.currentWaypoint = nearest + track.waypoints.length;
        } else {
            this.currentWaypoint = nearest;
        }
    }

    startBoost(duration, multiplier) {
        this.isBoosting = true;
        this.boostEndTime = performance.now() + duration;
        this.boostMultiplier = multiplier;
        this.flashWhite = true;
        this.flashEndTime = performance.now() + 200;
        this.updateMaterialFlash(true);
    }

    updateBoost() {
        if (this.isBoosting && performance.now() > this.boostEndTime) {
            this.isBoosting = false;
            this.boostMultiplier = 1;
        }
    }

    updateFlash() {
        if (this.flashWhite && performance.now() > this.flashEndTime) {
            this.flashWhite = false;
            this.updateMaterialFlash(false);
        }
    }

    updateMaterialFlash(flash) {
        this.originalMaterials.forEach(mat => {
            if (flash) {
                mat.emissive = new THREE.Color(0xffffff);
                mat.emissiveIntensity = 1;
            } else {
                mat.emissive = new THREE.Color(0x000000);
                mat.emissiveIntensity = 0;
            }
        });
    }

    slowDown(factor) {
        this.speed *= factor;
    }

    setPosition(position) {
        this.group.position.copy(position);
    }

    setRotation(rotation) {
        this.group.rotation.copy(rotation);
    }

    getPosition() {
        return this.group.position.clone();
    }

    getRotation() {
        return this.group.rotation.clone();
    }

    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.group.quaternion);
        return forward;
    }

    reset() {
        this.speed = 0;
        this.lap = 1;
        this.currentWaypoint = 0;
        this.raceProgress = 0;
        this.isBoosting = false;
        this.boostMultiplier = 1;
        this.flashWhite = false;
        this.updateMaterialFlash(false);
        this.steerInput = 0;
        this.accelInput = 0;
        this.brakeInput = 0;
    }
}
