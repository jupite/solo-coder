import * as THREE from 'three';

class Environment {
    constructor(scene) {
        this.scene = scene;
        this.water = null;
        this.waterPositions = null;
        this.grass = null;
        this.pondRadius = 12;
        this.grassSize = 50;
        
        this.init();
    }

    init() {
        this.createGrass();
        this.createPond();
        this.createTrees();
    }

    createGrass() {
        const grassGeometry = new THREE.PlaneGeometry(this.grassSize, this.grassSize, 50, 50);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            roughness: 0.8,
            metalness: 0.1
        });

        const positions = grassGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            const distance = Math.sqrt(x * x + z * z);
            if (distance < this.pondRadius + 1) {
                positions.setZ(i, -0.1);
            } else {
                positions.setZ(i, (Math.random() - 0.5) * 0.3);
            }
        }
        grassGeometry.computeVertexNormals();

        this.grass = new THREE.Mesh(grassGeometry, grassMaterial);
        this.grass.rotation.x = -Math.PI / 2;
        this.grass.receiveShadow = true;
        this.scene.add(this.grass);
    }

    createPond() {
        const waterGeometry = new THREE.PlaneGeometry(this.pondRadius * 2, this.pondRadius * 2, 64, 64);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x1E90FF,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.3,
            side: THREE.DoubleSide
        });

        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = 0.01;
        this.water.receiveShadow = true;
        this.scene.add(this.water);

        this.waterPositions = this.water.geometry.attributes.position;

        const pondEdgeGeometry = new THREE.RingGeometry(this.pondRadius - 0.5, this.pondRadius + 0.5, 64);
        const pondEdgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const pondEdge = new THREE.Mesh(pondEdgeGeometry, pondEdgeMaterial);
        pondEdge.rotation.x = -Math.PI / 2;
        pondEdge.position.y = 0.02;
        this.scene.add(pondEdge);

        for (let i = 0; i < 20; i++) {
            this.createReed();
        }
    }

    createReed() {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.pondRadius + 0.5 + Math.random() * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const reedGroup = new THREE.Group();

        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 2 + Math.random(), 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 1 + Math.random() * 0.5;
        stem.castShadow = true;
        reedGroup.add(stem);

        const leafGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
        const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 2 + Math.random() * 0.3;
        leaf.castShadow = true;
        reedGroup.add(leaf);

        reedGroup.position.set(x, 0, z);
        reedGroup.rotation.z = (Math.random() - 0.5) * 0.2;
        this.scene.add(reedGroup);
    }

    createTrees() {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = this.pondRadius + 8 + Math.random() * 5;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            this.createTree(x, z);
        }
    }

    createTree(x, z) {
        const treeGroup = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 5;
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(x, 0, z);
        treeGroup.scale.setScalar(0.8 + Math.random() * 0.5);
        this.scene.add(treeGroup);
    }

    update(deltaTime, elapsedTime) {
        if (this.waterPositions) {
            const positions = this.waterPositions;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const distance = Math.sqrt(x * x + y * y);
                const wave = Math.sin(distance * 2 + elapsedTime * 3) * 0.05 +
                            Math.sin(x * 3 + elapsedTime * 2) * 0.03;
                positions.setZ(i, wave);
            }
            positions.needsUpdate = true;
            this.water.geometry.computeVertexNormals();
        }
    }

    getPondRadius() {
        return this.pondRadius;
    }

    getWater() {
        return this.water;
    }
}

export default Environment;
