class AIController {
    constructor(scene, track, index) {
        this.scene = scene;
        this.track = track;
        this.index = index;
        
        this.car = new Car(scene, CONFIG.COLORS.AI_CARS[index % CONFIG.COLORS.AI_CARS.length], false);
        
        this.speedMultiplier = CONFIG.AI.BASE_SPEED_MULTIPLIER + 
            (Math.random() - 0.5) * CONFIG.AI.SPEED_VARIANCE * 2;
        
        this.targetWaypointOffset = CONFIG.AI.LOOK_AHEAD;
        this.currentTargetWaypoint = 0;
        this.pathOffset = (Math.random() - 0.5) * (CONFIG.TRACK.WIDTH * 0.6);
        
        this.init();
    }

    init() {
        const startPos = this.track.getStartPosition();
        const startRot = this.track.getStartRotation();
        const startDir = this.track.waypoints[1] ? 
            new THREE.Vector3().subVectors(this.track.waypoints[1], this.track.waypoints[0]).normalize() :
            new THREE.Vector3(0, 0, 1);
        const startPerp = new THREE.Vector3(-startDir.z, 0, startDir.x);
        
        const offsetForward = (this.index + 1) * 6;
        const offsetSide = (this.index % 2 === 0 ? 1 : -1) * 5;
        
        this.car.setPosition(new THREE.Vector3(
            startPos.x - startDir.x * offsetForward + startPerp.x * offsetSide,
            startPos.y,
            startPos.z - startDir.z * offsetForward + startPerp.z * offsetSide
        ));
        this.car.setRotation(startRot);
        this.car.maxSpeed *= this.speedMultiplier;
    }

    update(deltaTime) {
        this.updateTargetWaypoint();
        this.calculateSteering();
        this.calculateAcceleration();
        this.car.update(deltaTime, this.track);
    }

    updateTargetWaypoint() {
        const nearestWaypoint = this.track.getNearestWaypoint(this.car.getPosition());
        this.currentTargetWaypoint = (nearestWaypoint + this.targetWaypointOffset) % this.track.waypoints.length;
    }

    calculateSteering() {
        const carPos = this.car.getPosition();
        const targetPos = this.getTargetPosition();
        
        const toTarget = new THREE.Vector3().subVectors(targetPos, carPos);
        toTarget.y = 0;
        toTarget.normalize();
        
        const carForward = this.car.getForwardDirection();
        carForward.y = 0;
        carForward.normalize();
        
        const cross = new THREE.Vector3().crossVectors(carForward, toTarget);
        const dot = carForward.dot(toTarget);
        
        const steerAmount = cross.y;
        
        if (steerAmount > 0.1) {
            this.car.steerInput = 1;
        } else if (steerAmount < -0.1) {
            this.car.steerInput = -1;
        } else {
            this.car.steerInput = steerAmount * 10;
        }
        
        if (dot < -0.5) {
            this.car.steerInput = steerAmount > 0 ? 1 : -1;
        }
    }

    getTargetPosition() {
        const waypoint = this.track.getWaypoint(this.currentTargetWaypoint);
        const nextWaypoint = this.track.getWaypoint(this.currentTargetWaypoint + 1);
        
        const direction = new THREE.Vector3().subVectors(nextWaypoint, waypoint).normalize();
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
        
        return waypoint.clone().add(perpendicular.multiplyScalar(this.pathOffset));
    }

    calculateAcceleration() {
        const carPos = this.car.getPosition();
        const targetPos = this.getTargetPosition();
        
        const toTarget = new THREE.Vector3().subVectors(targetPos, carPos);
        toTarget.y = 0;
        
        const distance = toTarget.length();
        toTarget.normalize();
        
        const carForward = this.car.getForwardDirection();
        carForward.y = 0;
        carForward.normalize();
        
        const dot = carForward.dot(toTarget);
        
        const nextNextWaypoint = this.track.getWaypoint(this.currentTargetWaypoint + 2);
        const waypoint = this.track.getWaypoint(this.currentTargetWaypoint);
        const nextWaypoint = this.track.getWaypoint(this.currentTargetWaypoint + 1);
        
        const dir1 = new THREE.Vector3().subVectors(nextWaypoint, waypoint).normalize();
        const dir2 = new THREE.Vector3().subVectors(nextNextWaypoint, nextWaypoint).normalize();
        const angleChange = Math.abs(dir1.dot(dir2));
        
        const slowdownFactor = Math.max(0.5, angleChange);
        
        if (dot > 0.5 && distance > 10) {
            this.car.accelInput = slowdownFactor;
            this.car.brakeInput = 0;
        } else if (dot > 0) {
            this.car.accelInput = 0.5 * slowdownFactor;
            this.car.brakeInput = 0;
        } else {
            this.car.accelInput = 0.1;
            this.car.brakeInput = 0.3;
        }
    }

    getCar() {
        return this.car;
    }

    reset() {
        this.car.reset();
        this.init();
    }
}
