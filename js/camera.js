import * as THREE from 'three';

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        
        this.distance = 12;
        this.height = 6;
        this.smoothness = 0.1;
        
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }
    
    update(truck) {
        const truckPos = truck.position;
        const truckRot = truck.rotation;
        
        const backward = new THREE.Vector3(
            -Math.sin(truckRot.y),
            0,
            -Math.cos(truckRot.y)
        );
        
        const offset = backward.clone().multiplyScalar(this.distance);
        offset.y = this.height;
        
        this.targetPosition.copy(truckPos).add(offset);
        
        this.targetLookAt.copy(truckPos);
        this.targetLookAt.y += 2;
        
        this.currentPosition.lerp(this.targetPosition, this.smoothness);
        this.currentLookAt.lerp(this.targetLookAt, this.smoothness);
        
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
        
        const speedFactor = Math.min(1, Math.abs(truck.speed) / 30);
        this.camera.fov = 60 + speedFactor * 20;
        this.camera.updateProjectionMatrix();
    }
    
    reset(truck) {
        const truckPos = truck.position;
        const truckRot = truck.rotation;
        
        const backward = new THREE.Vector3(
            -Math.sin(truckRot.y),
            0,
            -Math.cos(truckRot.y)
        );
        
        const offset = backward.clone().multiplyScalar(this.distance);
        offset.y = this.height;
        
        this.currentPosition.copy(truckPos).add(offset);
        this.currentLookAt.copy(truckPos);
        this.currentLookAt.y += 2;
        
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}
