import * as THREE from 'three';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        this.init();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 100, 500);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.clock = new THREE.Clock();
        
        this.setupLights();
        this.setupEnvironment();
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        this.scene.add(directionalLight);
        
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3d, 0.4);
        this.scene.add(hemisphereLight);
    }
    
    setupEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c4e,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const positions = groundGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 2 + 
                         Math.sin(x * 0.1 + y * 0.1) * 0.5;
            positions.setZ(i, noise);
        }
        groundGeometry.computeVertexNormals();
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.ground = ground;
        
        this.addTrees();
    }
    
    addTrees() {
        const treePositions = [];
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 400;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            if (Math.abs(x) > 20 || Math.abs(z) > 20) {
                treePositions.push(new THREE.Vector3(x, 0, z));
            }
        }
        
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const leavesGeometry = new THREE.ConeGeometry(2, 5, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        
        treePositions.forEach(pos => {
            const tree = new THREE.Group();
            
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            trunk.castShadow = true;
            tree.add(trunk);
            
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 6;
            leaves.castShadow = true;
            tree.add(leaves);
            
            tree.position.copy(pos);
            tree.position.y = this.getGroundHeight(pos.x, pos.z);
            this.scene.add(tree);
        });
    }
    
    getGroundHeight(x, z) {
        const noise = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 + 
                     Math.sin(x * 0.1 + z * 0.1) * 0.5;
        return noise;
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    getDeltaTime() {
        return this.clock.getDelta();
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
