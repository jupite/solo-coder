export class DefenseTurret {
    constructor(scene, x, y) {
        this.scene = scene;
        this.mesh = null;
        this.health = 1;
        this.maxHealth = 1;
        this.movePattern = 'stationary';
        this.isExploding = false;
        this.explosionTimer = 0;
        this.createTurret(x, y);
    }
    
    createTurret(x, y) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0x222222,
            shininess: 25
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0;
        group.add(base);
        
        const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x555555,
            emissive: 0x222222,
            shininess: 30
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 0.75;
        group.add(pole);
        
        const spikeGeometry = new THREE.ConeGeometry(0.4, 2, 8);
        const spikeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff3333,
            emissive: 0x661111,
            shininess: 40
        });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.y = 2;
        spike.rotation.x = Math.PI;
        group.add(spike);
        
        this.mesh = group;
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        if (this.isExploding) {
            this.explosionTimer += deltaTime;
            this.mesh.scale.setScalar(1 - this.explosionTimer * 3);
        }
    }
    
    triggerExplosion() {
        this.isExploding = true;
    }
    
    isActive() {
        return !this.isExploding;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.triggerExplosion();
        }
        return this.health <= 0;
    }
    
    getScore() {
        return 2;
    }
    
    getFragments() {
        return [];
    }
    
    shouldRemove() {
        return this.isExploding && this.explosionTimer > 0.3;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}