import * as THREE from 'three';

export class CargoSystem {
    constructor(scene) {
        this.scene = scene;
        this.boxes = [];
        this.droppedCount = 0;
        this.deliveredCount = 0;
        this.onBoxDropped = null;
        this.onBoxDelivered = null;
        
        this.boxSize = { width: 1.2, height: 1.2, length: 1.2 };
        this.boxColors = [0x8B4513, 0xA0522D, 0xD2691E, 0xCD853F, 0xDEB887];
        
        this.gravity = -20;
        this.friction = 0.9;
        this.bounceFactor = 0.3;
    }
    
    createBox(position, color) {
        const geometry = new THREE.BoxGeometry(
            this.boxSize.width,
            this.boxSize.height,
            this.boxSize.length
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        this.addBoxEdges(mesh);
        
        return mesh;
    }
    
    addBoxEdges(boxMesh) {
        const edgesGeometry = new THREE.EdgesGeometry(boxMesh.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x5D4037,
            linewidth: 2
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        boxMesh.add(edges);
    }
    
    setupCargo(truck) {
        this.boxes.forEach(box => {
            this.scene.remove(box.mesh);
        });
        this.boxes = [];
        this.droppedCount = 0;
        this.deliveredCount = 0;
        
        const boxPositions = this.generateBoxPositions();
        
        boxPositions.forEach((localPos, index) => {
            const color = this.boxColors[index % this.boxColors.length];
            const worldPos = truck.group.localToWorld(localPos.clone());
            const mesh = this.createBox(worldPos, color);
            
            this.boxes.push({
                mesh,
                localPosition: localPos,
                velocity: new THREE.Vector3(),
                angularVelocity: new THREE.Vector3(),
                isOnTruck: true,
                hasFallen: false,
                hasLanded: false
            });
            
            this.scene.add(mesh);
        });
    }
    
    generateBoxPositions() {
        const boxH = this.boxSize.height;

        const floorTop = 0.65;
        const boxCenterY = floorTop + boxH / 2;

        const layer1 = [
            new THREE.Vector3(-0.65, boxCenterY, -1.3),
            new THREE.Vector3(0.65, boxCenterY, -1.3),
            new THREE.Vector3(-0.65, boxCenterY, -2.9),
            new THREE.Vector3(0.65, boxCenterY, -2.9),
        ];

        const layer2 = [
            new THREE.Vector3(0, boxCenterY + boxH, -2.1),
        ];

        return [...layer1, ...layer2];
    }
    
    update(deltaTime, truck, road) {
        const truckPos = truck.position;
        const truckRot = truck.rotation;
        
        this.boxes.forEach(box => {
            if (box.isOnTruck && !box.hasFallen) {
                this.updateBoxOnTruck(box, truck, deltaTime);
            } else if (box.hasFallen) {
                this.updateFallenBox(box, deltaTime, road);
            }
        });

        this.resolveBoxCollisions(truck);
    }
    
    updateBoxOnTruck(box, truck, deltaTime) {
        const localPos = box.localPosition.clone();
        const targetWorldPos = truck.group.localToWorld(localPos);

        const offset = new THREE.Vector3().subVectors(box.mesh.position, targetWorldPos);
        offset.y = 0;

        const springForce = offset.multiplyScalar(-12);
        box.velocity.add(springForce.multiplyScalar(deltaTime));

        this.applyForces(box, truck, deltaTime);

        box.velocity.multiplyScalar(0.92);

        const maxVel = 2.5;
        if (box.velocity.length() > maxVel) {
            box.velocity.setLength(maxVel);
        }

        box.mesh.position.addScaledVector(box.velocity, deltaTime);

        const boxLocalPos = box.mesh.position.clone();
        truck.group.worldToLocal(boxLocalPos);

        const halfBox = this.boxSize.width / 2;
        const bedLeft = -1.4 + halfBox;
        const bedRight = 1.4 - halfBox;
        const bedFront = -0.4 - halfBox;
        const bedRear = -4.0 + halfBox;
        const bedBottom = 0.65 + halfBox;

        let collided = false;
        const invQuat = new THREE.Quaternion().setFromEuler(truck.rotation).invert();
        const localVel = box.velocity.clone().applyQuaternion(invQuat);

        if (boxLocalPos.x < bedLeft) {
            boxLocalPos.x = bedLeft;
            localVel.x = Math.max(0, localVel.x);
            collided = true;
        }
        if (boxLocalPos.x > bedRight) {
            boxLocalPos.x = bedRight;
            localVel.x = Math.min(0, localVel.x);
            collided = true;
        }
        if (boxLocalPos.z > bedFront) {
            boxLocalPos.z = bedFront;
            localVel.z = Math.min(0, localVel.z);
            collided = true;
        }
        if (boxLocalPos.z < bedRear) {
            boxLocalPos.z = bedRear;
            localVel.z = Math.max(0, localVel.z);
            collided = true;
        }
        if (boxLocalPos.y < bedBottom) {
            boxLocalPos.y = bedBottom;
            localVel.y = Math.max(0, localVel.y);
            collided = true;
        }

        if (collided) {
            localVel.multiplyScalar(0.5);
        }

        localVel.applyQuaternion(truck.group.quaternion);
        box.velocity.copy(localVel);

        truck.group.localToWorld(boxLocalPos);
        box.mesh.position.copy(boxLocalPos);

        const targetQuat = new THREE.Quaternion().setFromEuler(truck.rotation);
        box.mesh.quaternion.slerp(targetQuat, 0.3);

        this.checkFall(box, truck);
    }
    
    applyForces(box, truck, deltaTime) {
        if (Math.abs(truck.steering) > 0.1 && Math.abs(truck.speed) > 5) {
            const centripetalDirection = new THREE.Vector3(
                Math.cos(truck.rotation.y),
                0,
                -Math.sin(truck.rotation.y)
            );
            
            const centripetalForce = centripetalDirection.multiplyScalar(
                truck.steering * truck.speed * 0.3
            );
            
            box.velocity.add(centripetalForce.multiplyScalar(deltaTime));
        }
        
        if (Math.abs(truck.suspensionVelocity.y) > 0.5) {
            const bumpForce = new THREE.Vector3(
                (Math.random() - 0.5) * truck.suspensionVelocity.y * 2,
                Math.abs(truck.suspensionVelocity.y) * 0.5,
                (Math.random() - 0.5) * truck.suspensionVelocity.y * 2
            );
            
            box.velocity.add(bumpForce.multiplyScalar(deltaTime));
        }
    }
    
    checkFall(box, truck) {
        const boxLocalPos = box.mesh.position.clone();
        truck.group.worldToLocal(boxLocalPos);

        const halfBox = this.boxSize.width / 2;
        const wallTop = 3.05 - halfBox;
        const bedLeft = -1.4 + halfBox;
        const bedRight = 1.4 - halfBox;
        const bedFront = -0.4 - halfBox;
        const bedRear = -4.0 + halfBox;

        const isOutsideX = boxLocalPos.x < bedLeft || boxLocalPos.x > bedRight;
        const isOutsideZ = boxLocalPos.z > bedFront || boxLocalPos.z < bedRear;
        const isAboveWalls = boxLocalPos.y > wallTop;
        const isBelowBed = boxLocalPos.y < 0.3;

        if ((isOutsideX || isOutsideZ) && isAboveWalls || isBelowBed) {
            this.dropBox(box, truck);
        }
    }
    
    dropBox(box, truck) {
        box.isOnTruck = false;
        box.hasFallen = true;
        
        box.velocity.set(
            box.velocity.x * 1.5 + (Math.random() - 0.5) * 3,
            Math.abs(box.velocity.y) + 3,
            box.velocity.z * 1.5 + (Math.random() - 0.5) * 3
        );
        
        box.angularVelocity.set(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );
        
        this.droppedCount++;
        
        if (this.onBoxDropped) {
            this.onBoxDropped();
        }
    }
    
    updateFallenBox(box, deltaTime, road) {
        if (box.hasLanded) return;
        
        box.velocity.y += this.gravity * deltaTime;
        
        box.mesh.position.addScaledVector(box.velocity, deltaTime);
        
        box.mesh.rotation.x += box.angularVelocity.x * deltaTime;
        box.mesh.rotation.y += box.angularVelocity.y * deltaTime;
        box.mesh.rotation.z += box.angularVelocity.z * deltaTime;
        
        const groundHeight = road.getRoadHeight(
            box.mesh.position.x,
            box.mesh.position.z
        ) + this.boxSize.height / 2;
        
        if (box.mesh.position.y < groundHeight) {
            box.mesh.position.y = groundHeight;
            
            if (box.velocity.y < -1) {
                box.velocity.y *= -this.bounceFactor;
                box.velocity.x *= this.friction;
                box.velocity.z *= this.friction;
                box.angularVelocity.multiplyScalar(this.friction);
            } else {
                box.velocity.multiplyScalar(0.5);
                box.angularVelocity.multiplyScalar(0.5);
                
                if (box.velocity.length() < 0.3) {
                    box.hasLanded = true;
                }
            }
        }
    }
    
    resolveBoxCollisions(truck) {
        const onTruckBoxes = this.boxes.filter(b => b.isOnTruck && !b.hasFallen);
        if (onTruckBoxes.length < 2) return;

        for (let i = 0; i < onTruckBoxes.length; i++) {
            for (let j = i + 1; j < onTruckBoxes.length; j++) {
                const boxA = onTruckBoxes[i];
                const boxB = onTruckBoxes[j];

                const posA = boxA.mesh.position.clone();
                const posB = boxB.mesh.position.clone();
                truck.group.worldToLocal(posA);
                truck.group.worldToLocal(posB);

                const delta = new THREE.Vector3().subVectors(posA, posB);
                const overlapX = this.boxSize.width - Math.abs(delta.x);
                const overlapY = this.boxSize.height - Math.abs(delta.y);
                const overlapZ = this.boxSize.length - Math.abs(delta.z);

                if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
                    if (overlapX <= overlapY && overlapX <= overlapZ) {
                        const push = overlapX / 2 * Math.sign(delta.x || 1);
                        posA.x += push;
                        posB.x -= push;
                    } else if (overlapZ <= overlapY) {
                        const push = overlapZ / 2 * Math.sign(delta.z || 1);
                        posA.z += push;
                        posB.z -= push;
                    } else {
                        const push = overlapY / 2 * Math.sign(delta.y || 1);
                        posA.y += push;
                        posB.y -= push;
                    }

                    const worldA = posA.clone();
                    const worldB = posB.clone();
                    truck.group.localToWorld(worldA);
                    truck.group.localToWorld(worldB);

                    boxA.mesh.position.copy(worldA);
                    boxB.mesh.position.copy(worldB);

                    const relVel = new THREE.Vector3().subVectors(boxA.velocity, boxB.velocity);
                    boxA.velocity.sub(relVel.multiplyScalar(0.3));
                    boxB.velocity.add(relVel.multiplyScalar(0.3));
                }
            }
        }
    }

    deliverCargo() {
        let delivered = 0;
        
        this.boxes.forEach(box => {
            if (box.isOnTruck && !box.hasFallen) {
                box.hasFallen = true;
                delivered++;
                
                this.scene.remove(box.mesh);
            }
        });
        
        this.deliveredCount = delivered;
        
        if (this.onBoxDelivered) {
            this.onBoxDelivered(delivered);
        }
        
        return delivered;
    }
    
    getRemainingCargoCount() {
        return this.boxes.filter(b => b.isOnTruck && !b.hasFallen).length;
    }
    
    getTotalCargoCount() {
        return this.boxes.length;
    }
    
    getDroppedCount() {
        return this.droppedCount;
    }
}
