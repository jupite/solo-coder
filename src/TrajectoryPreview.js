import * as THREE from 'three';

export class TrajectoryPreview {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.points = [];
        this.line = null;
        this.isVisible = false;
        this.maxPoints = 50;
        this.gravity = -9.82;
        
        this.createLine();
    }
    
    createLine() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxPoints * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineDashedMaterial({
            color: 0xffffff,
            linewidth: 2,
            dashSize: 0.3,
            gapSize: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        this.line = new THREE.Line(geometry, material);
        this.line.computeLineDistances();
        this.line.visible = false;
        this.sceneManager.add(this.line);
    }
    
    show() {
        this.isVisible = true;
        this.line.visible = true;
    }
    
    hide() {
        this.isVisible = false;
        this.line.visible = false;
    }
    
    update(startPosition, velocity) {
        if (!this.isVisible) return;
        
        const positions = this.line.geometry.attributes.position.array;
        const dt = 0.05;
        let pos = startPosition.clone();
        let vel = velocity.clone();
        
        for (let i = 0; i < this.maxPoints; i++) {
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
            
            vel.y += this.gravity * dt;
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
            pos.z += vel.z * dt;
            
            if (pos.y < 0) {
                for (let j = i + 1; j < this.maxPoints; j++) {
                    positions[j * 3] = pos.x;
                    positions[j * 3 + 1] = pos.y;
                    positions[j * 3 + 2] = pos.z;
                }
                break;
            }
        }
        
        this.line.geometry.attributes.position.needsUpdate = true;
        this.line.computeLineDistances();
    }
    
    dispose() {
        this.sceneManager.remove(this.line);
        this.line.geometry.dispose();
        this.line.material.dispose();
    }
}
