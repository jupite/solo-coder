import * as THREE from 'three';

export class PhysicsSimulator {
    constructor() {
        this.gravity = -9.8;
        this.groundFriction = 0.9;
        this.airFriction = 0.99;
        
        this.suspensionStiffness = 20;
        this.suspensionDamping = 5;
        this.suspensionRestLength = 0.5;
        
        this.boxStabilityThreshold = 0.5;
        this.boxFallThreshold = 1.5;
    }
    
    updateSuspension(truck, road, deltaTime) {
        const truckPos = truck.position;
        const roadHeight = road.getRoadHeight(truckPos.x, truckPos.z);
        
        const currentHeight = truck.suspensionOffset.y;
        const targetHeight = roadHeight - truckPos.y + 0.5;
        
        const springForce = (targetHeight - currentHeight) * this.suspensionStiffness;
        const dampingForce = truck.suspensionVelocity.y * this.suspensionDamping;
        
        const acceleration = springForce - dampingForce;
        truck.suspensionVelocity.y += acceleration * deltaTime;
        truck.suspensionOffset.y += truck.suspensionVelocity.y * deltaTime;
        
        const maxOffset = 0.3;
        truck.suspensionOffset.y = Math.max(-maxOffset, Math.min(maxOffset, truck.suspensionOffset.y));
    }
    
    calculateTruckTilt(truck, road, deltaTime) {
        const truckPos = truck.position;
        const forward = truck.getForwardVector();
        
        const frontPos = truckPos.clone().addScaledVector(forward, 2);
        const rearPos = truckPos.clone().addScaledVector(forward, -2);
        const leftPos = new THREE.Vector3(
            truckPos.x + Math.cos(truck.rotation.y) * 1.5,
            truckPos.y,
            truckPos.z - Math.sin(truck.rotation.y) * 1.5
        );
        const rightPos = new THREE.Vector3(
            truckPos.x - Math.cos(truck.rotation.y) * 1.5,
            truckPos.y,
            truckPos.z + Math.sin(truck.rotation.y) * 1.5
        );
        
        const frontHeight = road.getRoadHeight(frontPos.x, frontPos.z);
        const rearHeight = road.getRoadHeight(rearPos.x, rearPos.z);
        const leftHeight = road.getRoadHeight(leftPos.x, leftPos.z);
        const rightHeight = road.getRoadHeight(rightPos.x, rightPos.z);
        
        const pitchDiff = frontHeight - rearHeight;
        const rollDiff = leftHeight - rightHeight;
        
        const targetPitch = -Math.atan2(pitchDiff, 4) * 0.8;
        const targetRoll = Math.atan2(rollDiff, 3) * 0.6;
        
        truck.rotation.x += (targetPitch - truck.rotation.x) * Math.min(1, deltaTime * 5);
        truck.rotation.z += (targetRoll - truck.rotation.z) * Math.min(1, deltaTime * 5);
    }
    
    updateBoxPhysics(box, truck, deltaTime) {
        if (!box.isOnTruck) return;
        
        const truckAcceleration = (truck.speed - (truck.prevSpeed || truck.speed)) / deltaTime;
        const truckAngularVelocity = (truck.rotation.y - (truck.prevRotationY || truck.rotation.y)) / deltaTime;
        
        const inertiaForce = new THREE.Vector3(
            -truckAcceleration * Math.sin(truck.rotation.y),
            0,
            -truckAcceleration * Math.cos(truck.rotation.y)
        );
        
        const centripetalForce = new THREE.Vector3(
            Math.cos(truck.rotation.y) * truck.speed * truckAngularVelocity,
            0,
            -Math.sin(truck.rotation.y) * truck.speed * truckAngularVelocity
        );
        
        const suspensionForce = new THREE.Vector3(
            0,
            -truck.suspensionVelocity.y * 2,
            0
        );
        
        const totalForce = new THREE.Vector3()
            .add(inertiaForce.multiplyScalar(0.3))
            .add(centripetalForce.multiplyScalar(0.5))
            .add(suspensionForce.multiplyScalar(0.5));
        
        box.velocity.add(totalForce.multiplyScalar(deltaTime));
        
        box.velocity.multiplyScalar(this.airFriction);
        
        const maxVel = 3;
        if (box.velocity.length() > maxVel) {
            box.velocity.setLength(maxVel);
        }
        
        truck.prevSpeed = truck.speed;
        truck.prevRotationY = truck.rotation.y;
    }
    
    checkBoxStability(box, truck) {
        const velocityMagnitude = box.velocity.length();
        
        if (velocityMagnitude > this.boxFallThreshold) {
            return { stable: false, fallChance: Math.min(1, velocityMagnitude / 5) };
        }
        
        return { stable: velocityMagnitude < this.boxStabilityThreshold, fallChance: 0 };
    }
    
    applyBoxConstraints(box, truck) {
        const localPos = box.localPosition.clone();
        const worldPos = truck.group.localToWorld(localPos);
        
        const offset = box.mesh.position.clone().sub(worldPos);
        
        const constraintForce = offset.multiplyScalar(-5);
        box.velocity.add(constraintForce.multiplyScalar(0.1));
    }
    
    updateFallenBox(box, deltaTime, groundHeight) {
        if (box.hasLanded) return;
        
        box.velocity.y += this.gravity * deltaTime;
        
        box.mesh.position.addScaledVector(box.velocity, deltaTime);
        
        box.mesh.rotation.x += box.angularVelocity.x * deltaTime;
        box.mesh.rotation.y += box.angularVelocity.y * deltaTime;
        box.mesh.rotation.z += box.angularVelocity.z * deltaTime;
        
        if (box.mesh.position.y < groundHeight) {
            box.mesh.position.y = groundHeight;
            
            if (box.velocity.y < -1) {
                box.velocity.y *= -0.4;
                box.velocity.x *= this.groundFriction;
                box.velocity.z *= this.groundFriction;
                box.angularVelocity.multiplyScalar(this.groundFriction);
            } else {
                box.velocity.multiplyScalar(0.5);
                box.angularVelocity.multiplyScalar(0.5);
                
                if (box.velocity.length() < 0.3) {
                    box.hasLanded = true;
                }
            }
        }
    }
}
