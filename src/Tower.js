import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Tower {
    constructor(sceneManager, physicsWorld) {
        this.sceneManager = sceneManager;
        this.physicsWorld = physicsWorld;
        this.blocks = [];
        this.blockSize = { width: 2, height: 1, depth: 1 };
        this.fallThreshold = 0.5;
    }
    
    build(centerX = 0, centerZ = 0, floors = 8) {
        this.clear();
        
        const blockMaterial = new CANNON.Material({
            friction: 0.4,
            restitution: 0.1
        });
        
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7, 0xDDA0DD, 0x98D8C8, 0xF7DC6F];
        
        for (let floor = 0; floor < floors; floor++) {
            const y = 1.5 + floor * this.blockSize.height;
            const isEvenFloor = floor % 2 === 0;
            
            let blocksInFloor = 3;
            if (floor >= floors - 2) blocksInFloor = 2;
            if (floor === floors - 1) blocksInFloor = 1;
            
            for (let i = 0; i < blocksInFloor; i++) {
                const color = colors[floor % colors.length];
                let x, z;
                
                if (isEvenFloor) {
                    x = centerX + (i - (blocksInFloor - 1) / 2) * (this.blockSize.width + 0.05);
                    z = centerZ;
                } else {
                    x = centerX;
                    z = centerZ + (i - (blocksInFloor - 1) / 2) * (this.blockSize.width + 0.05);
                }
                
                this.createBlock(x, y, z, isEvenFloor, color, blockMaterial);
            }
        }
    }
    
    createBlock(x, y, z, rotated, color, physicsMaterial) {
        const width = rotated ? this.blockSize.depth : this.blockSize.width;
        const depth = rotated ? this.blockSize.width : this.blockSize.depth;
        
        const geometry = new THREE.BoxGeometry(width, this.blockSize.height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6,
            metalness: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.sceneManager.add(mesh);
        
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, this.blockSize.height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 1,
            shape: shape,
            material: physicsMaterial
        });
        body.position.set(x, y, z);
        body.linearDamping = 0.1;
        body.angularDamping = 0.1;
        this.physicsWorld.addBody(body);
        
        const block = {
            mesh: mesh,
            body: body,
            initialPosition: new THREE.Vector3(x, y, z),
            hasFallen: false
        };
        
        this.blocks.push(block);
    }
    
    update() {
        for (const block of this.blocks) {
            block.mesh.position.copy(block.body.position);
            block.mesh.quaternion.copy(block.body.quaternion);
        }
    }
    
    countFallenBlocks() {
        let fallenCount = 0;
        
        for (const block of this.blocks) {
            if (block.hasFallen) continue;
            
            const position = block.body.position;
            const initialY = block.initialPosition.y;
            
            if (position.y < initialY - this.fallThreshold) {
                block.hasFallen = true;
                fallenCount++;
            }
            
            const velocity = block.body.velocity;
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
            if (speed > 5 && !block.hasFallen) {
                block.hasFallen = true;
                fallenCount++;
            }
        }
        
        return fallenCount;
    }
    
    clear() {
        for (const block of this.blocks) {
            this.sceneManager.remove(block.mesh);
            this.physicsWorld.removeBody(block.body);
        }
        this.blocks = [];
    }
    
    getTotalBlocks() {
        return this.blocks.length;
    }
    
    areAllBlocksSleeping() {
        for (const block of this.blocks) {
            const speed = block.body.velocity.length();
            const angularSpeed = block.body.angularVelocity.length();
            if (speed > 0.1 || angularSpeed > 0.1) {
                return false;
            }
        }
        return true;
    }
}
