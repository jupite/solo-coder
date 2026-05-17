import * as THREE from 'three';

class Fish {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.isActive = false;
        this.isJumping = false;
        this.jumpProgress = 0;
        this.startPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.tailWagOffset = 0;
        this.fishType = 0;
        
        this.init();
    }

    init() {
        const fishGroup = new THREE.Group();

        const bodyGeometry = new THREE.ConeGeometry(0.4, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6347,
            roughness: 0.4,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        fishGroup.add(body);

        const tailGeometry = new THREE.ConeGeometry(0.35, 0.5, 4);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF4500,
            roughness: 0.5
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -0.9;
        tail.rotation.z = Math.PI / 2;
        tail.castShadow = true;
        this.tail = tail;
        fishGroup.add(tail);

        const finGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
        const finMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6347,
            roughness: 0.4
        });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.set(0, 0.3, 0);
        fin.rotation.z = Math.PI;
        fin.castShadow = true;
        fishGroup.add(fin);

        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.3
        });
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(0.5, 0.1, 0.15);
        fishGroup.add(eye);

        const pupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000
        });
        const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil.position.set(0.55, 0.1, 0.2);
        fishGroup.add(pupil);

        this.mesh = fishGroup;
        this.mesh.position.set(0, -10, 0);
        this.mesh.visible = false;
        this.scene.add(this.mesh);
    }

    spawn(position) {
        this.mesh.position.copy(position);
        this.mesh.position.y = -2;
        this.mesh.visible = true;
        this.isActive = true;
        this.isJumping = false;
        this.jumpProgress = 0;
        this.tailWagOffset = Math.random() * Math.PI * 2;
        
        const colors = [0xFF6347, 0x4169E1, 0x32CD32, 0xFFD700, 0x9370DB];
        this.fishType = Math.floor(Math.random() * colors.length);
        this.mesh.children[0].material.color.setHex(colors[this.fishType]);
        this.mesh.children[1].material.color.setHex(colors[this.fishType] - 0x222222);
    }

    jumpTo(target) {
        this.startPosition.copy(this.mesh.position);
        this.targetPosition.copy(target);
        this.targetPosition.y = 3;
        this.isJumping = true;
        this.jumpProgress = 0;
    }

    escape() {
        this.targetPosition.copy(this.mesh.position);
        this.targetPosition.y = -5;
        this.targetPosition.x += (Math.random() - 0.5) * 10;
        this.targetPosition.z += (Math.random() - 0.5) * 10;
        this.isJumping = true;
        this.jumpProgress = 0;
    }

    reset() {
        this.mesh.position.set(0, -10, 0);
        this.mesh.visible = false;
        this.isActive = false;
        this.isJumping = false;
        this.jumpProgress = 0;
    }

    update(deltaTime, elapsedTime) {
        if (!this.isActive) return;

        if (this.isJumping) {
            this.jumpProgress += deltaTime * 1.5;
            if (this.jumpProgress >= 1) {
                if (this.mesh.position.y < -2) {
                    this.reset();
                    return;
                }
                this.jumpProgress = 1;
            }

            const t = this.jumpProgress;
            const easeT = t * t * (3 - 2 * t);
            const height = Math.sin(t * Math.PI) * 5;

            this.mesh.position.lerpVectors(
                this.startPosition,
                this.targetPosition,
                easeT
            );
            this.mesh.position.y += height;

            const angle = Math.atan2(
                this.targetPosition.z - this.startPosition.z,
                this.targetPosition.x - this.startPosition.x
            );
            this.mesh.rotation.y = angle;
            this.mesh.rotation.z = Math.sin(t * Math.PI) * 0.5;
        } else {
            this.mesh.rotation.y = Math.sin(elapsedTime * 2 + this.tailWagOffset) * 0.2;
            this.tail.rotation.y = Math.sin(elapsedTime * 8 + this.tailWagOffset) * 0.5;
        }
    }

    isActiveFish() {
        return this.isActive;
    }

    getPosition() {
        return this.mesh.position.clone();
    }
}

export default Fish;
