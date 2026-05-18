export class LargeAsteroid {
    constructor(scene, x, y) {
        this.scene = scene;
        this.mesh = null;
        this.speed = 1.5 + Math.random() * 1;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        this.health = 4;
        this.maxHealth = 4;
        this.movePattern = Math.random() > 0.5 ? 'straight' : 'wave';
        this.initialX = x;
        this.time = 0;
        this.createAsteroid(x, y);
    }
    
    createAsteroid(x, y) {
        const size = 2.5 + Math.random() * 1.5;
        const geometry = new THREE.IcosahedronGeometry(size, 2);
        
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const px = positions.getX(i);
            const py = positions.getY(i);
            const pz = positions.getZ(i);
            const noise = (Math.random() - 0.5) * size * 0.35;
            positions.setX(i, px + noise);
            positions.setY(i, py + noise);
            positions.setZ(i, pz + noise);
        }
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x665544,
            emissive: 0x221111,
            shininess: 8
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
                this.mesh.position.x = this.initialX + Math.sin(this.time * 1.5) * 5;
                break;
        }
        
        this.mesh.rotation.x += this.rotationSpeed;
        this.mesh.rotation.y += this.rotationSpeed * 0.6;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    getScore() {
        return 5;
    }
    
    getFragments() {
        if (this.health <= 0) {
            const fragments = [];
            const pos = this.mesh.position;
            for (let i = 0; i < 2; i++) {
                fragments.push({
                    type: 'small_asteroid',
                    x: pos.x + (Math.random() - 0.5) * 4,
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
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}