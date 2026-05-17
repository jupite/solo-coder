import { Mesh, IcosahedronGeometry, MeshPhongMaterial, Vector3 } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

class Asteroid {
    constructor(scene, x, y) {
        this.scene = scene;
        this.mesh = null;
        this.speed = 2 + Math.random() * 3;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.createAsteroid(x, y);
    }
    
    createAsteroid(x, y) {
        const size = 1 + Math.random() * 2;
        const geometry = new IcosahedronGeometry(size, 1);
        
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const noise = (Math.random() - 0.5) * size * 0.3;
            positions.setX(i, x + noise);
            positions.setY(i, y + noise);
            positions.setZ(i, z + noise);
        }
        geometry.computeVertexNormals();
        
        const material = new MeshPhongMaterial({ 
            color: 0x666666,
            emissive: 0x222222,
            shininess: 10
        });
        
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        this.mesh.position.y -= this.speed * deltaTime;
        this.mesh.rotation.x += this.rotationSpeed;
        this.mesh.rotation.y += this.rotationSpeed * 0.7;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class AsteroidManager {
    constructor(scene) {
        this.scene = scene;
        this.asteroids = [];
    }
    
    addAsteroid(x, y) {
        const asteroid = new Asteroid(this.scene, x, y);
        this.asteroids.push(asteroid);
    }
    
    removeAsteroid(index) {
        if (this.asteroids[index]) {
            this.asteroids[index].destroy();
            this.asteroids.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            this.asteroids[i].update(deltaTime);
        }
    }
    
    getAsteroids() {
        return this.asteroids;
    }
    
    clear() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            this.removeAsteroid(i);
        }
    }
}