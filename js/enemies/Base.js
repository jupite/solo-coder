export class Base {
    constructor(scene, x, y, playerBulletManager) {
        this.scene = scene;
        this.playerBulletManager = playerBulletManager;
        this.mesh = null;
        this.health = 8;
        this.maxHealth = 8;
        this.movePattern = 'stationary';
        this.time = 0;
        this.lastFireTime = 0;
        this.fireRate = 800;
        this.turrets = [
            { angle: 0 },
            { angle: Math.PI / 4 },
            { angle: -Math.PI / 4 },
            { angle: Math.PI / 2 },
            { angle: -Math.PI / 2 }
        ];
        this.createBase(x, y);
    }
    
    createBase(x, y) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.CylinderGeometry(2.5, 3, 1.5, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333366,
            emissive: 0x111133,
            shininess: 20
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0;
        group.add(base);
        
        const coreGeometry = new THREE.BoxGeometry(2, 2, 2);
        const coreMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4444aa,
            emissive: 0x222266,
            shininess: 50
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 1.5;
        group.add(core);
        
        const turretGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1, 8);
        const turretMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x555555,
            emissive: 0x222222,
            shininess: 30
        });
        
        const positions = [
            { x: 0, y: 2.5, z: 0 },
            { x: 1.5, y: 2, z: 0 },
            { x: -1.5, y: 2, z: 0 },
            { x: 0, y: 2, z: 1.5 },
            { x: 0, y: 2, z: -1.5 }
        ];
        
        positions.forEach((pos, i) => {
            const turret = new THREE.Mesh(turretGeometry, turretMaterial);
            turret.position.set(pos.x, pos.y, pos.z);
            group.add(turret);
        });
        
        this.mesh = group;
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    fireBullets() {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate) {
            const pos = this.mesh.position;
            
            this.turrets.forEach((turret) => {
                const bulletX = pos.x + Math.sin(turret.angle) * 3;
                const bulletY = pos.y + Math.cos(turret.angle) * 3 - 2;
                this.playerBulletManager.addEnemyBullet(bulletX, bulletY, -1);
                turret.angle += 0.15;
            });
            
            this.lastFireTime = now;
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        this.fireBullets();
        this.mesh.rotation.y += deltaTime * 0.2;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    getScore() {
        return 12;
    }
    
    getFragments() {
        return [];
    }
    
    shouldRemove() {
        return false;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}