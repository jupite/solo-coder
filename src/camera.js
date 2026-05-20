import * as THREE from 'three';

export class FollowCamera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.offset = new THREE.Vector3(-8, 5, 12);
        this.lookOffset = new THREE.Vector3(0, 1, 0);
        this.smoothness = 0.1;

        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();

        window.addEventListener('resize', () => this.onResize());
    }

    update(target, deltaTime) {
        const targetPos = target.position.clone();

        this.targetPosition.copy(targetPos).add(this.offset);
        this.targetLookAt.copy(targetPos).add(this.lookOffset);

        this.camera.position.lerp(this.targetPosition, this.smoothness);
        this.camera.lookAt(this.targetLookAt);
    }

    reset(target) {
        const targetPos = target.position.clone();
        this.camera.position.copy(targetPos).add(this.offset);
        this.camera.lookAt(targetPos.clone().add(this.lookOffset));
    }

    getCamera() {
        return this.camera;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
