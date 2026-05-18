export class BossShip {
    constructor(scene, x, y, playerBulletManager) {
        this.scene = scene;
        this.playerBulletManager = playerBulletManager;
        this.mesh = null;
        this.speed = 0.8;
        this.health = 10;
        this.maxHealth = 10;
        this.movePattern = 'wave';
        this.initialX = x;
        this.time = 0;
        this.lastFireTime = 0;
        this.fireRate = 1500;
        this.createShip(x, y);
    }
    
    createShip(x, y) {
        const group = new THREE.Group();
        
        const bodyGeometry = new THREE.BoxGeometry(3, 4, 1.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x992266,
            emissive: 0x441133,
            shininess: 40
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0;
        group.add(body);
        
        const wingGeometry = new THREE.BoxGeometry(4, 0.8, 0.5);
        const wingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x771155,
            emissive: 0x330022,
            shininess: 25
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-3, -1, 0);
        leftWing.rotation.z = -0.2;
        group.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(3, -1, 0);
        rightWing.rotation.z = 0.2;
        group.add(rightWing);
        
        const cockpitGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 16);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x66aaff,
            emissive: 0x225588,
            shininess: 100,
            transparent: true,
            opacity: 0.85
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 1, 0.8);
        group.add(cockpit);
        
        const gunGeometry = new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8);
        const gunMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0x222222,
            shininess: 30
        });
        
        const leftGun = new THREE.Mesh(gunGeometry, gunMaterial);
        leftGun.position.set(-1.2, 0.5, 0.8);
        leftGun.rotation.z = -0.3;
        group.add(leftGun);
        
        const rightGun = new THREE.Mesh(gunGeometry, gunMaterial);
        rightGun.position.set(1.2, 0.5, 0.8);
        rightGun.rotation.z = 0.3;
        group.add(rightGun);
        
        const topGun = new THREE.Mesh(gunGeometry, gunMaterial);
        topGun.position.set(0, 1.8, 0.8);
        topGun.rotation.x = Math.PI / 2;
        group.add(topGun);
        
        this.mesh = group;
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    fireBullets() {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            const pos = this.mesh.position;
            
            this.playerBulletManager.addEnemyBullet(pos.x - 1.2, pos.y - 0.5, -1);
            this.playerBulletManager.addEnemyBullet(pos.x + 1.2, pos.y - 0.5, -1);
            this.playerBulletManager.addEnemyBullet(pos.x, pos.y - 1.8, -1);
            
            const spread = 0.3;
            this.playerBulletManager.addEnemyBullet(pos.x - 1.2, pos.y - 0.5, -1 - spread);
            this.playerBulletManager.addEnemyBullet(pos.x + 1.2, pos.y - 0.5, -1 + spread);
            
            this.lastFireTime = now;
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        switch(this.movePattern) {
            case 'wave':
                this.mesh.position.y -= this.speed * deltaTime;
                this.mesh.position.x = this.initialX + Math.sin(this.time * 1) * 8;
                break;
        }
        
        this.fireBullets();
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    getScore() {
        return 15;
    }
    
    getFragments() {
        if (this.health <= 0) {
            const fragments = [];
            const pos = this.mesh.position;
            for (let i = 0; i < 3; i++) {
                fragments.push({
                    type: 'enemy_ship',
                    x: pos.x + (Math.random() - 0.5) * 6,
                    y: pos.y
                });
            }
            return fragments;
        }
        return [];
    }
    
    shouldRemove() {
        return this.mesh.position.y < -35;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}