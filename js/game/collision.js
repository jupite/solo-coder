import { CONFIG } from './config.js';

export class CollisionSystem {
    constructor() {
        this.obstacleCooldowns = new Map();
    }

    checkCarObstacleCollision(car, obstacleSystem) {
        const carPos = car.getPosition();
        const carRadius = Math.max(CONFIG.CAR.WIDTH, CONFIG.CAR.LENGTH) / 2;
        
        if (obstacleSystem.checkCollision(carPos, carRadius)) {
            const carId = car.isPlayer ? 'player' : `ai_${Math.random()}`;
            const now = performance.now();
            const lastHit = this.obstacleCooldowns.get(carId) || 0;
            
            if (now - lastHit > 1000) {
                car.slowDown(CONFIG.OBSTACLES.SLOW_DOWN_FACTOR);
                this.obstacleCooldowns.set(carId, now);
                return true;
            }
        }
        return false;
    }

    checkCarPowerupCollision(car, powerupSystem) {
        const carPos = car.getPosition();
        const carRadius = Math.max(CONFIG.CAR.WIDTH, CONFIG.CAR.LENGTH) / 2;
        
        if (powerupSystem.checkCollision(carPos, carRadius)) {
            car.startBoost(CONFIG.POWERUPS.BOOST_DURATION, CONFIG.POWERUPS.BOOST_MULTIPLIER);
            return true;
        }
        return false;
    }

    checkCarCarCollision(car1, car2) {
        const pos1 = car1.getPosition();
        const pos2 = car2.getPosition();
        const radius = Math.max(CONFIG.CAR.WIDTH, CONFIG.CAR.LENGTH) / 2;
        
        const distance = pos1.distanceTo(pos2);
        if (distance < radius * 2) {
            const pushDir = new THREE.Vector3().subVectors(pos1, pos2).normalize();
            const pushAmount = (radius * 2 - distance) * 0.5;
            
            car1.group.position.add(pushDir.clone().multiplyScalar(pushAmount));
            car2.group.position.add(pushDir.clone().multiplyScalar(-pushAmount));
            
            const avgSpeed = (car1.speed + car2.speed) / 2;
            car1.speed = avgSpeed * 0.8;
            car2.speed = avgSpeed * 0.8;
            
            return true;
        }
        return false;
    }

    checkAllCarCollisions(cars) {
        for (let i = 0; i < cars.length; i++) {
            for (let j = i + 1; j < cars.length; j++) {
                this.checkCarCarCollision(cars[i], cars[j]);
            }
        }
    }

    checkTrackBoundary(car, track) {
        const carPos = car.getPosition();
        const nearestWaypoint = track.getNearestWaypoint(carPos);
        const waypoint = track.getWaypoint(nearestWaypoint);
        
        const distanceFromCenter = Math.sqrt(
            (carPos.x - waypoint.x) ** 2 +
            (carPos.z - waypoint.z) ** 2
        );
        
        const maxDistance = CONFIG.TRACK.WIDTH / 2 + 2;
        
        if (distanceFromCenter > maxDistance) {
            car.slowDown(0.95);
            
            const toCenter = new THREE.Vector3()
                .subVectors(waypoint, carPos)
                .normalize();
            
            car.group.position.add(toCenter.multiplyScalar(0.5));
            
            return true;
        }
        return false;
    }
}
