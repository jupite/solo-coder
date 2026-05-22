import * as THREE from 'three';

export class Truck {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.velocity = new THREE.Vector3();
        this.speed = 0;
        this.steering = 0;
        
        this.maxSpeed = 30;
        this.acceleration = 15;
        this.brakeForce = 20;
        this.friction = 5;
        this.turnSpeed = 2;
        
        this.suspensionOffset = new THREE.Vector3();
        this.suspensionVelocity = new THREE.Vector3();
        
        this.cargoBedSize = { width: 3, height: 1.5, length: 5 };
        this.cargoBedLocalPosition = new THREE.Vector3(0, 1.2, -2);
        
        this.createTruck();
        
        scene.add(this.group);
    }
    
    createTruck() {
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcc3333,
            metalness: 0.6,
            roughness: 0.4
        });
        const darkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.3
        });
        const glassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x6699cc,
            metalness: 0.3,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        
        const chassis = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.5, 8),
            darkMaterial
        );
        chassis.position.y = 0.5;
        chassis.castShadow = true;
        this.group.add(chassis);
        
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 2, 2.5),
            bodyMaterial
        );
        cabin.position.set(0, 1.75, 2.5);
        cabin.castShadow = true;
        this.group.add(cabin);
        
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.3, 2.3),
            darkMaterial
        );
        roof.position.set(0, 2.9, 2.5);
        roof.castShadow = true;
        this.group.add(roof);
        
        const windshield = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 1.2, 0.1),
            glassMaterial
        );
        windshield.position.set(0, 2.3, 3.7);
        windshield.rotation.x = 0.2;
        this.group.add(windshield);
        
        const rearWindow = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 1.2, 0.1),
            glassMaterial
        );
        rearWindow.position.set(0, 2.3, 1.3);
        this.group.add(rearWindow);
        
        const cargoBed = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.3, 4.5),
            darkMaterial
        );
        cargoBed.position.set(0, 0.5, -2);
        cargoBed.castShadow = true;
        this.group.add(cargoBed);
        this.cargoBedMesh = cargoBed;
        
        const bedLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 2.4, 4.5),
            bodyMaterial
        );
        bedLeft.position.set(-1.5, 1.85, -2);
        bedLeft.castShadow = true;
        this.group.add(bedLeft);
        
        const bedRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 2.4, 4.5),
            bodyMaterial
        );
        bedRight.position.set(1.5, 1.85, -2);
        bedRight.castShadow = true;
        this.group.add(bedRight);
        
        const bedFront = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2.4, 0.2),
            bodyMaterial
        );
        bedFront.position.set(0, 1.85, 0.2);
        bedFront.castShadow = true;
        this.group.add(bedFront);
        
        const bedRear = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2.4, 0.2),
            bodyMaterial
        );
        bedRear.position.set(0, 1.85, -4.2);
        bedRear.castShadow = true;
        this.group.add(bedRear);
        
        const headlightLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.2),
            new THREE.MeshStandardMaterial({ 
                color: 0xffffcc,
                emissive: 0xffffcc,
                emissiveIntensity: 0.5
            })
        );
        headlightLeft.position.set(-1, 1.2, 3.9);
        this.group.add(headlightLeft);
        
        const headlightRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.2),
            new THREE.MeshStandardMaterial({ 
                color: 0xffffcc,
                emissive: 0xffffcc,
                emissiveIntensity: 0.5
            })
        );
        headlightRight.position.set(1, 1.2, 3.9);
        this.group.add(headlightRight);
        
        this.createWheels();
    }
    
    createWheels() {
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.9
        });
        const rimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.3
        });
        
        this.wheels = [];
        
        const wheelPositions = [
            { x: -1.4, z: 2.5, front: true },
            { x: 1.4, z: 2.5, front: true },
            { x: -1.4, z: -1.5, front: false },
            { x: 1.4, z: -1.5, front: false },
            { x: -1.4, z: -2.8, front: false },
            { x: 1.4, z: -2.8, front: false }
        ];
        
        wheelPositions.forEach((pos, index) => {
            const wheelGroup = new THREE.Group();
            
            const tire = new THREE.Mesh(wheelGeometry, wheelMaterial);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8),
                rimMaterial
            );
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            wheelGroup.position.set(pos.x, 0.5, pos.z);
            this.group.add(wheelGroup);
            
            this.wheels.push({
                mesh: wheelGroup,
                front: pos.front,
                rotation: 0
            });
        });
    }
    
    update(deltaTime, input, road) {
        const throttle = input.getThrottle();
        const steering = input.getSteering();
        
        if (throttle > 0) {
            this.speed += this.acceleration * throttle * deltaTime;
        } else if (throttle < 0) {
            this.speed += this.acceleration * throttle * deltaTime;
        } else {
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.friction * deltaTime);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.friction * deltaTime);
            }
        }
        
        this.speed = Math.max(-this.maxSpeed * 0.5, Math.min(this.maxSpeed, this.speed));
        
        this.steering = -steering * this.turnSpeed * (this.speed / this.maxSpeed);
        
        this.rotation.y += this.steering * deltaTime;
        
        const forward = new THREE.Vector3(
            Math.sin(this.rotation.y),
            0,
            Math.cos(this.rotation.y)
        );
        
        this.velocity.copy(forward).multiplyScalar(this.speed);
        this.position.addScaledVector(forward, this.speed * deltaTime);
        
        if (road) {
            const roadHeight = road.getRoadHeight(this.position.x, this.position.z);
            this.position.y = roadHeight;
            
            const targetHeight = roadHeight;
            const springForce = (targetHeight - this.suspensionOffset.y) * 10;
            const dampingForce = this.suspensionVelocity.y * 5;
            this.suspensionVelocity.y += (springForce - dampingForce) * deltaTime;
            this.suspensionOffset.y += this.suspensionVelocity.y * deltaTime;
            
            const nextPos = this.position.clone().add(forward.clone().multiplyScalar(2));
            const nextHeight = road.getRoadHeight(nextPos.x, nextPos.z);
            const heightDiff = nextHeight - this.position.y;
            this.rotation.x = Math.atan2(heightDiff, 2) * 0.5;
            
            const sidePos = new THREE.Vector3(
                this.position.x + Math.cos(this.rotation.y) * 2,
                0,
                this.position.z - Math.sin(this.rotation.y) * 2
            );
            const sideHeight = road.getRoadHeight(sidePos.x, sidePos.z);
            this.rotation.z = (sideHeight - this.position.y) * 0.2;
        }
        
        this.wheels.forEach(wheel => {
            wheel.rotation += this.speed * deltaTime * 2;
            wheel.mesh.children[0].rotation.x = wheel.rotation;
            
            if (wheel.front) {
                wheel.mesh.rotation.y = this.steering * 0.5;
            }
        });
        
        this.group.position.copy(this.position);
        this.group.position.y += this.suspensionOffset.y;
        this.group.rotation.copy(this.rotation);
    }
    
    getCargoBedPosition() {
        const bedPos = this.cargoBedLocalPosition.clone();
        bedPos.applyEuler(this.rotation);
        bedPos.add(this.position);
        return bedPos;
    }
    
    getCargoBedRotation() {
        return this.rotation.clone();
    }
    
    getSpeedKmh() {
        return Math.abs(this.speed) * 3.6;
    }
    
    getForwardVector() {
        return new THREE.Vector3(
            Math.sin(this.rotation.y),
            0,
            Math.cos(this.rotation.y)
        );
    }
    
    reset(position, direction) {
        this.position.copy(position);
        this.position.y += 1;
        this.velocity.set(0, 0, 0);
        this.speed = 0;
        this.steering = 0;
        this.suspensionOffset.set(0, 0, 0);
        this.suspensionVelocity.set(0, 0, 0);
        
        if (direction) {
            this.rotation.y = Math.atan2(direction.x, direction.z);
        } else {
            this.rotation.set(0, 0, 0);
        }
        
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);
    }
}
