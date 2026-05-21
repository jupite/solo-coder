import * as THREE from 'three';

export class CollisionManager {
    constructor(environment) {
        this.environment = environment;
        this.obstacles = environment.getObstacles();
        this.entities = [];
        this.collisionHappened = new Set();
    }
    
    registerEntity(entity, radius, isSheep = false) {
        this.entities.push({
            object: entity,
            radius: radius,
            isSheep: isSheep,
            lastPosition: entity.position.clone()
        });
    }
    
    updateEntities() {
        this.entities.forEach(entity => {
            entity.lastPosition.copy(entity.object.position);
        });
    }
    
    checkCollision(pos1, radius1, pos2, radius2) {
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < radius1 + radius2;
    }
    
    resolveCollision(pos1, radius1, pos2, radius2) {
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance === 0) {
            return new THREE.Vector3(1, 0, 0);
        }
        
        const overlap = radius1 + radius2 - distance;
        const nx = dx / distance;
        const nz = dz / distance;
        
        return new THREE.Vector3(nx * overlap, 0, nz * overlap);
    }
    
    resolveAllCollisions() {
        this.collisionHappened.clear();
        
        this.entities.forEach((entity, i) => {
            this.entities.forEach((other, j) => {
                if (i !== j) {
                    if (this.checkCollision(
                        entity.object.position, entity.radius,
                        other.object.position, other.radius
                    )) {
                        const push = this.resolveCollision(
                            entity.object.position, entity.radius,
                            other.object.position, other.radius
                        );
                        entity.object.position.add(push.multiplyScalar(0.5));
                        if (entity.isSheep) {
                            this.collisionHappened.add(entity.object.id);
                        }
                    }
                }
            });
        });
        
        this.entities.forEach(entity => {
            this.obstacles.forEach(obstacle => {
                if (this.checkCollision(
                    entity.object.position, entity.radius,
                    obstacle.position, obstacle.radius
                )) {
                    const push = this.resolveCollision(
                        entity.object.position, entity.radius,
                        obstacle.position, obstacle.radius
                    );
                    entity.object.position.add(push);
                    if (entity.isSheep) {
                        this.collisionHappened.add(entity.object.id);
                    }
                }
            });
        });
        
        const fieldLimit = 48;
        this.entities.forEach(entity => {
            entity.object.position.x = Math.max(-fieldLimit, Math.min(fieldLimit, entity.object.position.x));
            entity.object.position.z = Math.max(-fieldLimit, Math.min(fieldLimit, entity.object.position.z));
        });
    }
    
    didCollide(entityId) {
        return this.collisionHappened.has(entityId);
    }
}
