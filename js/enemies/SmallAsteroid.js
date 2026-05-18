export class SmallAsteroid {
    constructor(scene, x, y) {
        this.scene = scene;
        this.mesh = null;
        this.speed = 3 + Math.random() * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
        this.health = 1;
        this.maxHealth = 1;
        this.movePattern = 'straight';
        this.initialX = x;
        this.time = 0;
        this.createAsteroid(x, y);
    }
    
    createAsteroid(x, y) {
        const size = 0.8 + Math.random() * 0.6;
        const geometry = new THREE.IcosahedronGeometry(size, 1);
        
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const px = positions.getX(i);
            const py = positions.getY(i);
            const pz = positions.getZ(i);
            const noise = (Math.random() - 0.5) * size * 0.4;
            positions.setX(i, px + noise);
            positions.setY(i, py + noise);
            positions.setZ(i, pz + noise);
        }
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            emissive: 0x333333,
            shininess: 15
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
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
                this.mesh.position.x = this.initialX + Math.sin(this.time * 2) * 3;
                break;
        }
        
        this.mesh.rotation.x += this.rotationSpeed;
        this.mesh.rotation.y += this.rotationSpeed * 0.8;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    getScore() {
        return 1;
    }
    
    getFragments() {
        return [];
    }
    
    shouldRemove() {
        return this.mesh.position.y < -35;
    }
    
    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}