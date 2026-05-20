import * as THREE from 'three';

export class Sheepdog {
    constructor(scene) {
        this.scene = scene;
        this.speed = 12;
        this.rotationSpeed = 5;
        this.barkCooldown = 0;
        this.barkRadius = 15;
        this.isBarking = false;
        this.barkTimer = 0;
        this.fieldLimit = 48;
        
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };
        
        this.mesh = this.createDog();
        this.mesh.position.set(0, 0, 10);
        this.scene.add(this.mesh);
        
        this.setupControls();
    }
    
    createDog() {
        const dog = new THREE.Group();
        
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.6 });
        const furMaterial = new THREE.MeshStandardMaterial({ color: 0xD2691E, roughness: 0.7 });
        
        const bodyGeometry = new THREE.CapsuleGeometry(0.6, 1.2, 4, 8);
        const body = new THREE.Mesh(bodyGeometry, furMaterial);
        body.position.y = 1.2;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        dog.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        const head = new THREE.Mesh(headGeometry, furMaterial);
        head.position.set(0, 1.5, 1);
        head.castShadow = true;
        dog.add(head);
        
        const snoutGeometry = new THREE.ConeGeometry(0.25, 0.6, 8);
        const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
        snout.position.set(0, 1.4, 1.5);
        snout.rotation.x = -Math.PI / 2;
        snout.castShadow = true;
        dog.add(snout);
        
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 6);
        const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
        leftEar.position.set(-0.3, 2, 0.8);
        leftEar.rotation.z = 0.3;
        leftEar.castShadow = true;
        dog.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
        rightEar.position.set(0.3, 2, 0.8);
        rightEar.rotation.z = -0.3;
        rightEar.castShadow = true;
        dog.add(rightEar);
        
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.6, 1.4);
        dog.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 1.6, 1.4);
        dog.add(rightEye);
        
        const noseGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const nose = new THREE.Mesh(noseGeometry, eyeMaterial);
        nose.position.set(0, 1.4, 1.8);
        dog.add(nose);
        
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1, 8);
        const legPositions = [
            { x: -0.4, z: 0.5 },
            { x: 0.4, z: 0.5 },
            { x: -0.4, z: -0.5 },
            { x: 0.4, z: -0.5 }
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(pos.x, 0.5, pos.z);
            leg.castShadow = true;
            dog.add(leg);
            
            const pawGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const paw = new THREE.Mesh(pawGeometry, bodyMaterial);
            paw.position.set(pos.x, 0.1, pos.z);
            paw.castShadow = true;
            dog.add(paw);
        });
        
        const tailGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
        const tail = new THREE.Mesh(tailGeometry, furMaterial);
        tail.position.set(0, 1.5, -1.2);
        tail.rotation.x = Math.PI / 4;
        tail.castShadow = true;
        dog.add(tail);
        
        return dog;
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = true;
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.keys.space = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = false;
            }
            if (e.code === 'Space') {
                this.keys.space = false;
            }
        });
    }
    
    update(deltaTime) {
        this.move(deltaTime);
        
        if (this.barkCooldown > 0) {
            this.barkCooldown -= deltaTime;
        }
        
        if (this.barkTimer > 0) {
            this.barkTimer -= deltaTime;
            if (this.barkTimer <= 0) {
                this.isBarking = false;
            }
        }
        
        if (this.keys.space && this.barkCooldown <= 0) {
            this.bark();
        }
    }
    
    move(deltaTime) {
        const direction = new THREE.Vector3();
        
        if (this.keys.w) direction.z -= 1;
        if (this.keys.s) direction.z += 1;
        if (this.keys.a) direction.x -= 1;
        if (this.keys.d) direction.x += 1;
        
        if (direction.length() > 0) {
            direction.normalize();
            
            this.mesh.position.x += direction.x * this.speed * deltaTime;
            this.mesh.position.z += direction.z * this.speed * deltaTime;
            
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = THREE.MathUtils.lerp(
                this.mesh.rotation.y,
                targetRotation,
                this.rotationSpeed * deltaTime
            );
        }
        
        this.mesh.position.x = Math.max(-this.fieldLimit, Math.min(this.fieldLimit, this.mesh.position.x));
        this.mesh.position.z = Math.max(-this.fieldLimit, Math.min(this.fieldLimit, this.mesh.position.z));
    }
    
    bark() {
        this.isBarking = true;
        this.barkTimer = 0.3;
        this.barkCooldown = 1.5;
        
        this.showBarkEffect();
    }
    
    showBarkEffect() {
        const indicator = document.getElementById('bark-indicator');
        if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 500);
        }
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    isBarkingNow() {
        return this.isBarking;
    }
    
    getBarkRadius() {
        return this.barkRadius;
    }
}
