import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Projectile {
    constructor(sceneManager, physicsWorld) {
        this.sceneManager = sceneManager;
        this.physicsWorld = physicsWorld;
        this.spawnPosition = new THREE.Vector3(0, 3, 15);
        this.size = 0.8;
        this.isLaunched = false;
        this.mesh = null;
        this.body = null;
        this.onLandCallback = null;
        
        this.create();
    }
    
    create() {
        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFF5722,
            roughness: 0.5,
            metalness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.copy(this.spawnPosition);
        this.sceneManager.add(this.mesh);
        
        const shape = new CANNON.Box(new CANNON.Vec3(this.size / 2, this.size / 2, this.size / 2));
        this.body = new CANNON.Body({
            mass: 5,
            shape: shape,
            material: new CANNON.Material({
                friction: 0.3,
                restitution: 0.4
            })
        });
        this.body.position.copy(this.spawnPosition);
        this.body.linearDamping = 0.01;
        this.body.angularDamping = 0.01;
        this.physicsWorld.addBody(this.body);
        
        this.body.addEventListener('collide', this.onCollide.bind(this));
    }
    
    launch(velocity) {
        if (this.isLaunched) return;
        
        this.isLaunched = true;
        this.body.wakeUp();
        this.body.velocity.set(velocity.x, velocity.y, velocity.z);
        
        this.checkLanding();
    }
    
    onCollide(event) {
    }
    
    checkLanding() {
        const checkInterval = setInterval(() => {
            if (!this.isLaunched) {
                clearInterval(checkInterval);
                return;
            }
            
            const speed = this.body.velocity.length();
            const position = this.body.position;
            
            if (speed < 0.5 && position.y < this.size + 0.1) {
                clearInterval(checkInterval);
                if (this.onLandCallback) {
                    this.onLandCallback();
                }
            }
            
            if (position.y < -10) {
                clearInterval(checkInterval);
                if (this.onLandCallback) {
                    this.onLandCallback();
                }
            }
        }, 500);
    }
    
    update() {
        if (this.mesh && this.body) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
    }
    
    reset() {
        this.isLaunched = false;
        this.body.position.copy(this.spawnPosition);
        this.body.velocity.set(0, 0, 0);
        this.body.angularVelocity.set(0, 0, 0);
        this.body.quaternion.set(0, 0, 0, 1);
        this.body.sleep();
    }
    
    setOnLandCallback(callback) {
        this.onLandCallback = callback;
    }
    
    getPosition() {
        return this.body.position.clone();
    }
    
    dispose() {
        this.sceneManager.remove(this.mesh);
        this.physicsWorld.removeBody(this.body);
    }
}
