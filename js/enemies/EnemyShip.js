export class EnemyShip {
    constructor(scene, x, y) {
        this.scene = scene;
        this.mesh = null;
        this.speed = 2 + Math.random() * 1.5;
        this.health = 2;
        this.maxHealth = 2;
        this.movePattern = Math.random() > 0.3 ? 'wave' : 'straight';
        this.initialX = x;
        this.time = 0;
        this.createShip(x, y);
    }
    
    createShip(x, y) {
        const group = new THREE.Group();
        
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2.5, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff4444,
            emissive: 0x441111,
            shininess: 50
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0;
        group.add(body);
        
        const wingGeometry = new THREE.BoxGeometry(2, 0.5, 0.3);
        const wingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xcc3333,
            emissive: 0x331111,
            shininess: 30
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-1.5, -0.5, 0);
        group.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(1.5, -0.5, 0);
        group.add(rightWing);
        
        const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4488ff,
            emissive: 0x113366,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.5, 0.6);
        group.add(cockpit);
        
        this.mesh = group;
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        switch(this.movePattern) {
            case 'straight':
                this.mesh.position.y -= this.speed * deltaTime;
                break;
            case 'wave':
                this.mesh.position.y -= this.speed * deltaTime;
                this.mesh.position.x = this.initialX + Math.sin(this.time * 2.5) * 6;
                break;
        }
        
        this.mesh.rotation.z = Math.sin(this.time * 3) * 0.1;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    getScore() {
        return 3;
    }
    
    getFragments() {
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