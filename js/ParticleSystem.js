class Particle {
    constructor(x, y, z) {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.size = 0.1 + Math.random() * 0.2;
        this.color = Math.random() > 0.5 ? 0xff6600 : 0xffff00;
    }
    
    update(deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * 30));
        this.velocity.multiplyScalar(0.98);
        this.life -= this.decay;
        return this.life > 0;
    }
}

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.points = null;
        this.geometry = null;
        this.material = null;
    }
    
    createExplosion(x, y, z) {
        const particleCount = 20 + Math.floor(Math.random() * 20);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, z));
        }
        
        this.updateGeometry();
    }
    
    updateGeometry() {
        if (this.points) {
            this.scene.remove(this.points);
            this.geometry.dispose();
            this.material.dispose();
        }
        
        if (this.particles.length === 0) return;
        
        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 3);
        const sizes = new Float32Array(this.particles.length);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;
            
            const hex = p.color;
            colors[i * 3] = ((hex >> 16) & 255) / 255;
            colors[i * 3 + 1] = ((hex >> 8) & 255) / 255;
            colors[i * 3 + 2] = (hex & 255) / 255;
            
            sizes[i] = p.size * p.life;
        }
        
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        this.material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            sizeAttenuation: true
        });
        
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }
    
    update(deltaTime) {
        this.particles = this.particles.filter(p => p.update(deltaTime));
        this.updateGeometry();
    }
    
    clear() {
        this.particles = [];
        if (this.points) {
            this.scene.remove(this.points);
            this.geometry.dispose();
            this.material.dispose();
            this.points = null;
            this.geometry = null;
            this.material = null;
        }
    }
}