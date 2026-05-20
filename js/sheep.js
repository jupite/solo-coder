import * as THREE from 'three';

export class Sheep {
    constructor(scene, index, environment) {
        this.scene = scene;
        this.index = index;
        this.environment = environment;
        
        this.wanderSpeed = 3;
        this.fleeSpeed = 8;
        this.scaredSpeed = 12;
        this.fleeRadius = 8;
        this.scaredRadius = 15;
        
        this.isInPen = false;
        this.isScared = false;
        this.scaredTimer = 0;
        
        this.wanderDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        ).normalize();
        this.wanderTimer = 0;
        this.wanderInterval = 2 + Math.random() * 3;
        
        this.fieldLimit = 48;
        
        this.mesh = this.createSheep();
        this.setInitialPosition();
        this.scene.add(this.mesh);
    }
    
    createSheep() {
        const sheep = new THREE.Group();
        
        const woolMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.8 });
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.7 });
        
        const bodyGeometry = new THREE.SphereGeometry(0.8, 12, 10);
        const body = new THREE.Mesh(bodyGeometry, woolMaterial);
        body.position.y = 1.2;
        body.scale.set(1, 0.9, 1.3);
        body.castShadow = true;
        sheep.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.45, 10, 8);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.set(0, 1.4, 1);
        head.castShadow = true;
        sheep.add(head);
        
        const earGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const leftEar = new THREE.Mesh(earGeometry, skinMaterial);
        leftEar.position.set(-0.35, 1.6, 0.8);
        leftEar.scale.set(1, 0.5, 1);
        leftEar.castShadow = true;
        sheep.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, skinMaterial);
        rightEar.position.set(0.35, 1.6, 0.8);
        rightEar.scale.set(1, 0.5, 1);
        rightEar.castShadow = true;
        sheep.add(rightEar);
        
        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.5, 1.35);
        sheep.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 1.5, 1.35);
        sheep.add(rightEye);
        
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.9, 8);
        const legPositions = [
            { x: -0.35, z: 0.4 },
            { x: 0.35, z: 0.4 },
            { x: -0.35, z: -0.4 },
            { x: 0.35, z: -0.4 }
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, 0.45, pos.z);
            leg.castShadow = true;
            sheep.add(leg);
        });
        
        const tailGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const tail = new THREE.Mesh(tailGeometry, woolMaterial);
        tail.position.set(0, 1.2, -1.1);
        tail.castShadow = true;
        sheep.add(tail);
        
        return sheep;
    }
    
    setInitialPosition() {
        const penCenter = this.environment.getPenCenter();
        let x, z;
        let attempts = 0;
        
        do {
            x = (Math.random() - 0.5) * 60;
            z = (Math.random() - 0.5) * 60;
            attempts++;
        } while (
            Math.abs(x - penCenter.x) < 20 && 
            Math.abs(z - penCenter.z) < 20 && 
            attempts < 100
        );
        
        this.mesh.position.set(x, 0, z);
    }
    
    update(deltaTime, dogPosition, dogBarking, dogBarkRadius) {
        if (this.isInPen) {
            this.updateInPen(deltaTime);
            return;
        }
        
        if (this.isScared) {
            this.scaredTimer -= deltaTime;
            if (this.scaredTimer <= 0) {
                this.isScared = false;
            }
        }
        
        const distanceToDog = this.mesh.position.distanceTo(dogPosition);
        
        if (dogBarking && distanceToDog < dogBarkRadius) {
            this.isScared = true;
            this.scaredTimer = 2;
        }
        
        let moveDirection = new THREE.Vector3();
        let currentSpeed = this.wanderSpeed;
        
        if (this.isScared || distanceToDog < this.fleeRadius) {
            moveDirection.subVectors(this.mesh.position, dogPosition).normalize();
            currentSpeed = this.isScared ? this.scaredSpeed : this.fleeSpeed;
        } else {
            this.wanderTimer -= deltaTime;
            if (this.wanderTimer <= 0) {
                this.changeWanderDirection();
            }
            moveDirection.copy(this.wanderDirection);
            currentSpeed = this.wanderSpeed;
        }
        
        this.mesh.position.x += moveDirection.x * currentSpeed * deltaTime;
        this.mesh.position.z += moveDirection.z * currentSpeed * deltaTime;
        
        if (moveDirection.length() > 0.1) {
            const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
            this.mesh.rotation.y = THREE.MathUtils.lerp(
                this.mesh.rotation.y,
                targetRotation,
                5 * deltaTime
            );
        }
        
        this.mesh.position.x = Math.max(-this.fieldLimit, Math.min(this.fieldLimit, this.mesh.position.x));
        this.mesh.position.z = Math.max(-this.fieldLimit, Math.min(this.fieldLimit, this.mesh.position.z));
        
        if (this.environment.isInsidePen(this.mesh.position)) {
            this.isInPen = true;
        }
    }
    
    updateInPen(deltaTime) {
        this.wanderTimer -= deltaTime;
        if (this.wanderTimer <= 0) {
            this.changeWanderDirection();
        }
        
        const speed = this.wanderSpeed * 0.3;
        this.mesh.position.x += this.wanderDirection.x * speed * deltaTime;
        this.mesh.position.z += this.wanderDirection.z * speed * deltaTime;
        
        const penCenter = this.environment.getPenCenter();
        const halfPen = this.environment.penSize / 2 - 1;
        
        if (Math.abs(this.mesh.position.x - penCenter.x) > halfPen) {
            this.wanderDirection.x *= -1;
            this.mesh.position.x = penCenter.x + Math.sign(this.mesh.position.x - penCenter.x) * halfPen;
        }
        if (Math.abs(this.mesh.position.z - penCenter.z) > halfPen) {
            this.wanderDirection.z *= -1;
            this.mesh.position.z = penCenter.z + Math.sign(this.mesh.position.z - penCenter.z) * halfPen;
        }
        
        if (this.wanderDirection.length() > 0.1) {
            const targetRotation = Math.atan2(this.wanderDirection.x, this.wanderDirection.z);
            this.mesh.rotation.y = THREE.MathUtils.lerp(
                this.mesh.rotation.y,
                targetRotation,
                2 * deltaTime
            );
        }
    }
    
    changeWanderDirection() {
        this.wanderDirection.set(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        ).normalize();
        this.wanderTimer = 1 + Math.random() * 2;
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    isInsidePen() {
        return this.isInPen;
    }
}

export class SheepManager {
    constructor(scene, count, environment) {
        this.scene = scene;
        this.sheepList = [];
        
        for (let i = 0; i < count; i++) {
            const sheep = new Sheep(scene, i, environment);
            this.sheepList.push(sheep);
        }
    }
    
    update(deltaTime, dogPosition, dogBarking, dogBarkRadius) {
        this.sheepList.forEach(sheep => {
            sheep.update(deltaTime, dogPosition, dogBarking, dogBarkRadius);
        });
    }
    
    getSheepInPenCount() {
        return this.sheepList.filter(sheep => sheep.isInsidePen()).length;
    }
    
    getAllInPen() {
        return this.sheepList.every(sheep => sheep.isInsidePen());
    }
    
    getSheepCount() {
        return this.sheepList.length;
    }
}
