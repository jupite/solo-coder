import { Mesh, Geometry, Material, Vector3, Shape, ExtrudeGeometry, MeshPhongMaterial } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.speed = 30;
        this.maxX = 28;
        this.minX = -28;
        
        this.createPlayer();
    }
    
    createPlayer() {
        const shape = new Shape();
        shape.moveTo(0, 3);
        shape.lineTo(-2, -2);
        shape.lineTo(2, -2);
        shape.lineTo(0, 3);
        
        const extrudeSettings = {
            depth: 1,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 0.1,
            bevelThickness: 0.1
        };
        
        const geometry = new ExtrudeGeometry(shape, extrudeSettings);
        const material = new MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x0088aa,
            shininess: 100
        });
        
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.y = -20;
        this.mesh.position.z = 0;
        this.mesh.rotation.x = Math.PI / 2;
        
        this.scene.add(this.mesh);
    }
    
    update(keys, mouseX, useMouseControl, deltaTime) {
        if (useMouseControl) {
            this.mesh.position.x = mouseX;
        } else {
            if (keys.left) {
                this.mesh.position.x -= this.speed * deltaTime;
            }
            if (keys.right) {
                this.mesh.position.x += this.speed * deltaTime;
            }
        }
        
        this.mesh.position.x = Math.max(this.minX, Math.min(this.maxX, this.mesh.position.x));
    }
    
    getPosition() {
        return new Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    }
    
    reset() {
        this.mesh.position.x = 0;
        this.mesh.position.y = -20;
        this.mesh.position.z = 0;
    }
}