import * as THREE from 'three';

export class Player {
    constructor(wireHeight) {
        this.group = new THREE.Group();
        this.wireHeight = wireHeight;

        this.moveSpeed = 0.3;
        this.tiltForce = 4;
        this.maxTiltAngle = Math.PI / 2.2;

        this.position = 0;
        this.tiltAngle = 0;
        this.angularVelocity = 0;
        this.isFalling = false;
        this.fallVelocity = new THREE.Vector3(0, 0, 0);
        this.fallRotation = new THREE.Vector3(0, 0, 0);

        this.createCharacter();
        this.reset();
    }

    createCharacter() {
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });

        const bodyGroup = new THREE.Group();

        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.9;
        head.castShadow = true;
        bodyGroup.add(head);

        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.28, 2.0, -0.12);
        bodyGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.28, 2.0, 0.12);
        bodyGroup.add(rightEye);

        const torsoGeometry = new THREE.BoxGeometry(0.35, 0.9, 0.6);
        const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        torso.position.y = 1.1;
        torso.castShadow = true;
        bodyGroup.add(torso);

        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(0, 1.1, -0.45);
        leftArm.rotation.x = -Math.PI / 6;
        leftArm.castShadow = true;
        bodyGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(0, 1.1, 0.45);
        rightArm.rotation.x = Math.PI / 6;
        rightArm.castShadow = true;
        bodyGroup.add(rightArm);

        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1565c0 });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0, 0.3, -0.15);
        leftLeg.castShadow = true;
        bodyGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0, 0.3, 0.15);
        rightLeg.castShadow = true;
        bodyGroup.add(rightLeg);

        const footGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.15);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(0.08, -0.1, -0.15);
        leftFoot.castShadow = true;
        bodyGroup.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.08, -0.1, 0.15);
        rightFoot.castShadow = true;
        bodyGroup.add(rightFoot);

        const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 4, 8);
        const balancePole = new THREE.Mesh(poleGeometry, poleMaterial);
        balancePole.rotation.x = Math.PI / 2;
        balancePole.position.y = 1.3;
        balancePole.castShadow = true;
        bodyGroup.add(balancePole);

        this.bodyGroup = bodyGroup;
        this.group.add(bodyGroup);
    }

    reset() {
        this.position = 0;
        this.tiltAngle = 0;
        this.angularVelocity = 0;
        this.isFalling = false;
        this.fallVelocity.set(0, 0, 0);
        this.fallRotation.set(0, 0, 0);

        this.group.position.set(0, this.wireHeight + 0.2, 0);
        this.group.rotation.set(0, 0, 0);
        this.bodyGroup.rotation.set(0, 0, 0);
    }

    update(deltaTime, inputTilt) {
        if (this.isFalling) {
            this.updateFalling(deltaTime);
            return;
        }

        this.position += this.moveSpeed * deltaTime;

        this.inputTorque = inputTilt * this.tiltForce;

        this.group.position.x = this.position;
        this.bodyGroup.rotation.x = this.tiltAngle;
    }

    applyWindEffect(windForce, deltaTime) {
        if (this.isFalling) return;

        this.windTorque = windForce * 1.2;
    }

    getInputTorque() {
        return this.inputTorque || 0;
    }

    getWindTorque() {
        return this.windTorque || 0;
    }

    setTiltAngle(angle) {
        this.tiltAngle = angle;
    }

    setAngularVelocity(velocity) {
        this.angularVelocity = velocity;
    }

    startFalling() {
        if (this.isFalling) return;

        this.isFalling = true;
        const fallDirection = this.tiltAngle > 0 ? 1 : -1;
        this.fallVelocity.set(
            this.moveSpeed * 0.5,
            2,
            fallDirection * 3
        );
        this.fallRotation.set(
            fallDirection * 8,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 5
        );
    }

    updateFalling(deltaTime) {
        this.fallVelocity.y -= 9.8 * deltaTime;

        this.group.position.add(this.fallVelocity.clone().multiplyScalar(deltaTime));
        this.group.rotation.x += this.fallRotation.x * deltaTime;
        this.group.rotation.y += this.fallRotation.y * deltaTime;
        this.group.rotation.z += this.fallRotation.z * deltaTime;
    }

    getTiltAngle() {
        return this.tiltAngle;
    }

    getPosition() {
        return this.position;
    }

    getGroup() {
        return this.group;
    }

    getIsFalling() {
        return this.isFalling;
    }

    getMaxTiltAngle() {
        return this.maxTiltAngle;
    }
}
