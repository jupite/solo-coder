class Bullet {
    constructor(scene, x, y, isEnemy = false) {
        this.scene = scene;
        this.mesh = null;
        this.speed = isEnemy ? 12 : 25;
        this.isEnemy = isEnemy;
        this.createBullet(x, y);
    }
    
    createBullet(x, y) {
        const geometry = new THREE.SphereGeometry(this.isEnemy ? 0.4 : 0.3, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.isEnemy ? 0xff4444 : 0xffff00,
            emissive: this.isEnemy ? 0x661111 : 0xff8800,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        const direction = this.isEnemy ? -1 : 1;
        this.mesh.position.y += this.speed * direction * deltaTime;
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
        this.playerBullets = [];
        this.enemyBullets = [];
        this.maxPlayerBullets = 10;
    }
    
    addBullet(x, y) {
        if (this.playerBullets.length < this.maxPlayerBullets) {
            const bullet = new Bullet(this.scene, x, y, false);
            this.playerBullets.push(bullet);
        }
    }
    
    addEnemyBullet(x, y, angle = -1) {
        const bullet = new Bullet(this.scene, x, y, true);
        bullet.angle = angle;
        this.enemyBullets.push(bullet);
    }
    
    removePlayerBullet(index) {
        if (this.playerBullets[index]) {
            this.playerBullets[index].destroy();
            this.playerBullets.splice(index, 1);
        }
    }
    
    removeEnemyBullet(index) {
        if (this.enemyBullets[index]) {
            this.enemyBullets[index].destroy();
            this.enemyBullets.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.playerBullets[i].update(deltaTime);
            
            if (this.playerBullets[i].mesh.position.y > 30) {
                this.removePlayerBullet(i);
            }
        }
        
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].update(deltaTime);
            
            if (this.enemyBullets[i].mesh.position.y < -30) {
                this.removeEnemyBullet(i);
            }
        }
    }
    
    getPlayerBullets() {
        return this.playerBullets.map(b => b.mesh);
    }
    
    getEnemyBullets() {
        return this.enemyBullets.map(b => b.mesh);
    }
    
    getAllBullets() {
        return [...this.getPlayerBullets(), ...this.getEnemyBullets()];
    }
    
    clear() {
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.removePlayerBullet(i);
        }
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.removeEnemyBullet(i);
        }
    }
    
    getEnemyBulletObjects() {
        return this.enemyBullets;
    }
}