import * as THREE from 'three';

export class GameScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.wireLength = 100;
        this.wireHeight = 15;

        this.createLights();
        this.createWire();
        this.createEnvironment();
        this.createStartEndMarkers();

        window.addEventListener('resize', () => this.onResize());
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -60;
        directionalLight.shadow.camera.right = 60;
        directionalLight.shadow.camera.top = 60;
        directionalLight.shadow.camera.bottom = -60;
        this.scene.add(directionalLight);
    }

    createWire() {
        const wireGroup = new THREE.Group();

        const wireGeometry = new THREE.CylinderGeometry(0.15, 0.15, this.wireLength, 16);
        const wireMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.8
        });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        wire.rotation.z = Math.PI / 2;
        wire.position.set(this.wireLength / 2, this.wireHeight, 0);
        wire.receiveShadow = true;
        wire.castShadow = true;
        wireGroup.add(wire);

        const poleGeometry = new THREE.CylinderGeometry(0.5, 0.8, this.wireHeight + 5, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8
        });

        const startPole = new THREE.Mesh(poleGeometry, poleMaterial);
        startPole.position.set(0, (this.wireHeight + 5) / 2 - 5, 0);
        startPole.castShadow = true;
        startPole.receiveShadow = true;
        wireGroup.add(startPole);

        const endPole = new THREE.Mesh(poleGeometry, poleMaterial);
        endPole.position.set(this.wireLength, (this.wireHeight + 5) / 2 - 5, 0);
        endPole.castShadow = true;
        endPole.receiveShadow = true;
        wireGroup.add(endPole);

        this.scene.add(wireGroup);
        this.wireGroup = wireGroup;
    }

    createStartEndMarkers() {
        const startMarker = new THREE.Group();
        const startGeometry = new THREE.BoxGeometry(3, 0.1, 3);
        const startMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const startBox = new THREE.Mesh(startGeometry, startMaterial);
        startBox.position.set(0, this.wireHeight - 0.5, 0);
        startBox.receiveShadow = true;
        startMarker.add(startBox);
        this.scene.add(startMarker);

        const endMarker = new THREE.Group();
        const endGeometry = new THREE.BoxGeometry(3, 0.1, 3);
        const endMaterial = new THREE.MeshStandardMaterial({ color: 0xff5722 });
        const endBox = new THREE.Mesh(endGeometry, endMaterial);
        endBox.position.set(this.wireLength, this.wireHeight - 0.5, 0);
        endBox.receiveShadow = true;
        endMarker.add(endBox);

        const flagPoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
        const flagPoleMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
        flagPole.position.set(this.wireLength, this.wireHeight + 2.5, 0);
        endMarker.add(flagPole);

        const flagGeometry = new THREE.PlaneGeometry(2, 1.2);
        const flagMaterial = new THREE.MeshStandardMaterial({
            color: 0xff5722,
            side: THREE.DoubleSide
        });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(this.wireLength + 1, this.wireHeight + 4.5, 0);
        endMarker.add(flag);

        this.scene.add(endMarker);
    }

    createEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7cb342,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5;
        ground.receiveShadow = true;
        this.scene.add(ground);

        this.createClouds();
        this.createDistantTrees();
    }

    createClouds() {
        const cloudGroup = new THREE.Group();
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Group();
            const size = 2 + Math.random() * 4;

            for (let j = 0; j < 5; j++) {
                const sphereGeometry = new THREE.SphereGeometry(size * (0.6 + Math.random() * 0.4), 8, 8);
                const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
                sphere.position.set(
                    (Math.random() - 0.5) * size * 2,
                    (Math.random() - 0.5) * size * 0.5,
                    (Math.random() - 0.5) * size * 1.5
                );
                cloud.add(sphere);
            }

            cloud.position.set(
                Math.random() * this.wireLength,
                40 + Math.random() * 30,
                -30 - Math.random() * 50
            );
            cloudGroup.add(cloud);
        }

        this.scene.add(cloudGroup);
        this.clouds = cloudGroup;
    }

    createDistantTrees() {
        const treeGroup = new THREE.Group();

        for (let i = 0; i < 30; i++) {
            const tree = new THREE.Group();

            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            trunk.castShadow = true;
            tree.add(trunk);

            const foliageGeometry = new THREE.ConeGeometry(2, 5, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 6;
            foliage.castShadow = true;
            tree.add(foliage);

            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            tree.position.set(
                this.wireLength / 2 + Math.cos(angle) * distance,
                -5,
                Math.sin(angle) * distance
            );
            tree.scale.setScalar(0.8 + Math.random() * 0.6);
            treeGroup.add(tree);
        }

        this.scene.add(treeGroup);
    }

    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(camera) {
        this.renderer.render(this.scene, camera);
    }

    getWireLength() {
        return this.wireLength;
    }

    getWireHeight() {
        return this.wireHeight;
    }

    dispose() {
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}
