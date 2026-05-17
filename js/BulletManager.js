import { Mesh, SphereGeometry, MeshPhongMaterial } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

class Bullet {
    constructor(scene, x, y) {
        this.scene = scene;
        this.mesh = null;
        this.speed = 25;
        this.createBullet(x, y);
    }
    
    createBullet(x, y) {
        const geometry = new SphereGeometry(0.3, 16, 16);
        const material = new MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xff8800,
            shininess: 100
        });
        
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        this.mesh.position.y += this.speed * deltaTime;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.maxBullets = 10;
    }
    
    addBullet(x, y) {
        if (this.bullets.length < this.maxBullets) {
            const bullet = new Bullet(this.scene, x, y);
            this.bullets.push(bullet);
        }
    }
    
    removeBullet(index) {
        if (this.bullets[index]) {
            this.bullets[index].destroy();
            this.bullets.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(deltaTime);
            
            if (this.bullets[i].mesh.position.y > 30) {
                this.removeBullet(i);
            }
        }
    }
    
    getBullets() {
        return this.bullets.map(b => b.mesh);
    }
    
    clear() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.removeBullet(i);
        }
    }
}