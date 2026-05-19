class CameraSystem {
    constructor(camera, targetCar) {
        this.camera = camera;
        this.targetCar = targetCar;
        
        this.distance = CONFIG.CAMERA.DISTANCE;
        this.height = CONFIG.CAMERA.HEIGHT;
        this.lerpSpeed = CONFIG.CAMERA.LERP_SPEED;
        this.lookAhead = CONFIG.CAMERA.LOOK_AHEAD;
        
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
    }

    update(deltaTime) {
        if (!this.targetCar) return;
        
        const carPos = this.targetCar.getPosition();
        const carForward = this.targetCar.getForwardDirection();
        const carRotation = this.targetCar.getRotation();
        
        const cameraOffset = new THREE.Vector3(0, this.height, -this.distance);
        cameraOffset.applyEuler(new THREE.Euler(0, carRotation.y, 0));
        
        const desiredPosition = carPos.clone().add(cameraOffset);
        
        const lookAheadOffset = carForward.clone().multiplyScalar(this.lookAhead);
        const desiredLookAt = carPos.clone().add(lookAheadOffset);
        desiredLookAt.y = carPos.y + 1;
        
        this.targetPosition.lerp(desiredPosition, this.lerpSpeed * deltaTime);
        this.targetLookAt.lerp(desiredLookAt, this.lerpSpeed * deltaTime);
        
        this.camera.position.copy(this.targetPosition);
        this.camera.lookAt(this.targetLookAt);
    }

    setTargetCar(car) {
        this.targetCar = car;
    }

    reset() {
        if (!this.targetCar) return;
        
        const carPos = this.targetCar.getPosition();
        const carRotation = this.targetCar.getRotation();
        
        const cameraOffset = new THREE.Vector3(0, this.height, -this.distance);
        cameraOffset.applyEuler(new THREE.Euler(0, carRotation.y, 0));
        
        this.camera.position.copy(carPos.clone().add(cameraOffset));
        this.camera.lookAt(carPos.clone().add(new THREE.Vector3(0, 1, 0)));
        
        this.targetPosition.copy(this.camera.position);
        this.targetLookAt.copy(carPos.clone().add(new THREE.Vector3(0, 1, 0)));
    }
}
