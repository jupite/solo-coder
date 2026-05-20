import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.fieldSize = 100;
        this.penSize = 15;
        this.penPosition = new THREE.Vector3(-30, 0, -30);
        
        this.createGround();
        this.createPen();
        this.createFences();
        this.createTrees();
    }
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(this.fieldSize, this.fieldSize, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c39,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] += (Math.random() - 0.5) * 0.3;
        }
        groundGeometry.computeVertexNormals();
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        this.createGrassTexture();
    }
    
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#4a7c39';
        ctx.fillRect(0, 0, 256, 256);
        
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 2 + 1;
            const green = 60 + Math.random() * 40;
            ctx.fillStyle = `rgb(${30 + Math.random() * 20}, ${green}, ${30 + Math.random() * 20})`;
            ctx.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
    }
    
    createPen() {
        const penGeometry = new THREE.PlaneGeometry(this.penSize, this.penSize);
        const penMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            transparent: true,
            opacity: 0.3
        });
        
        const pen = new THREE.Mesh(penGeometry, penMaterial);
        pen.rotation.x = -Math.PI / 2;
        pen.position.set(this.penPosition.x, 0.01, this.penPosition.z);
        pen.receiveShadow = true;
        this.scene.add(pen);
        
        const borderGeometry = new THREE.EdgesGeometry(penGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: 0x654321, linewidth: 3 });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        border.rotation.x = -Math.PI / 2;
        border.position.set(this.penPosition.x, 0.02, this.penPosition.z);
        this.scene.add(border);
    }
    
    createFences() {
        const fenceHeight = 2;
        const fenceThickness = 0.3;
        const postSpacing = 2;
        
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        const railMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D, roughness: 0.6 });
        
        const halfPen = this.penSize / 2;
        const corners = [
            { x: this.penPosition.x - halfPen, z: this.penPosition.z - halfPen },
            { x: this.penPosition.x + halfPen, z: this.penPosition.z - halfPen },
            { x: this.penPosition.x + halfPen, z: this.penPosition.z + halfPen },
            { x: this.penPosition.x - halfPen, z: this.penPosition.z + halfPen }
        ];
        
        for (let i = 0; i < 4; i++) {
            const start = corners[i];
            const end = corners[(i + 1) % 4];
            
            const dx = end.x - start.x;
            const dz = end.z - start.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const numPosts = Math.floor(length / postSpacing) + 1;
            
            for (let j = 0; j < numPosts; j++) {
                const t = j / (numPosts - 1);
                const px = start.x + dx * t;
                const pz = start.z + dz * t;
                
                if (i === 2 && j >= Math.floor(numPosts * 0.3) && j <= Math.floor(numPosts * 0.7)) {
                    continue;
                }
                
                const postGeometry = new THREE.BoxGeometry(fenceThickness, fenceHeight, fenceThickness);
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(px, fenceHeight / 2, pz);
                post.castShadow = true;
                post.receiveShadow = true;
                this.scene.add(post);
            }
            
            if (i !== 2) {
                for (let railY = 0.5; railY < fenceHeight; railY += 0.8) {
                    const railGeometry = new THREE.BoxGeometry(length, 0.2, 0.15);
                    const rail = new THREE.Mesh(railGeometry, railMaterial);
                    
                    const midX = (start.x + end.x) / 2;
                    const midZ = (start.z + end.z) / 2;
                    
                    rail.position.set(midX, railY, midZ);
                    rail.rotation.y = Math.atan2(dx, dz);
                    rail.castShadow = true;
                    rail.receiveShadow = true;
                    this.scene.add(rail);
                }
            }
        }
    }
    
    createTrees() {
        const treePositions = [
            { x: 40, z: 40 },
            { x: -40, z: 40 },
            { x: 40, z: -40 },
            { x: 45, z: 0 },
            { x: -45, z: 10 },
            { x: 0, z: 45 },
            { x: 20, z: -45 },
            { x: -20, z: -45 }
        ];
        
        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z);
        });
    }
    
    createTree(x, z) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 2, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.scene.add(trunk);
        
        const foliageGeometry = new THREE.SphereGeometry(2.5, 8, 6);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 5.5, z);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        this.scene.add(foliage);
        
        const foliage2 = new THREE.Mesh(
            new THREE.SphereGeometry(2, 8, 6),
            foliageMaterial
        );
        foliage2.position.set(x + 1, 6, z + 0.5);
        foliage2.castShadow = true;
        this.scene.add(foliage2);
    }
    
    isInsidePen(position) {
        const halfPen = this.penSize / 2;
        return (
            position.x >= this.penPosition.x - halfPen &&
            position.x <= this.penPosition.x + halfPen &&
            position.z >= this.penPosition.z - halfPen &&
            position.z <= this.penPosition.z + halfPen
        );
    }
    
    getPenCenter() {
        return this.penPosition.clone();
    }
}
