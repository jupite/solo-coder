export class StarField {
    constructor(scene) {
        this.scene = scene;
        this.points = null;
        this.starCount = 1000;
        this.speed = 0.5;
        
        this.createStars();
    }
    
    createStars() {
        const positions = new Float32Array(this.starCount * 3);
        
        for (let i = 0; i < this.starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({ 
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    }
    
    update(deltaTime) {
        const positions = this.points.geometry.attributes.position.array;
        
        for (let i = 0; i < this.starCount; i++) {
            positions[i * 3 + 1] -= this.speed * deltaTime;
            
            if (positions[i * 3 + 1] < -100) {
                positions[i * 3 + 1] = 100;
                positions[i * 3] = (Math.random() - 0.5) * 200;
            }
        }
        
        this.points.geometry.attributes.position.needsUpdate = true;
        this.points.rotation.y += 0.0001 * deltaTime;
    }
}