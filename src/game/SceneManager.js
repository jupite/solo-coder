import * as THREE from 'three';
import { COLORS, CONSTANTS } from './constants.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.trees = [];
    this.treeBranches = [];
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.SKY);
    this.scene.fog = new THREE.Fog(COLORS.SKY, 30, 80);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(-10, 6, 15);
    this.camera.lookAt(2, 3, -5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.addLights();
    this.createGround();
    this.createTrees();

    window.addEventListener('resize', () => this.onResize());
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x7CFC00, 0.4);
    this.scene.add(hemisphereLight);
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.GROUND,
      roughness: 0.8
    });
    
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const z = positions.getZ(i);
      positions.setZ(i, z + (Math.random() - 0.5) * 0.2);
    }
    groundGeometry.computeVertexNormals();

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createTrees() {
    const treePositions = [
      { x: -5, z: -5 },
      { x: 5, z: -8 },
      { x: 12, z: -5 },
      { x: 2, z: -15 },
      { x: -3, z: -18 }
    ];

    treePositions.forEach((pos, index) => {
      const tree = this.createTree();
      tree.position.set(pos.x, 0, pos.z);
      tree.scale.setScalar(0.8 + Math.random() * 0.5);
      this.scene.add(tree);
      this.trees.push(tree);

      const branches = this.getTreeBranchPositions(tree);
      branches.forEach(branch => {
        this.treeBranches.push({
          position: branch.position,
          hasBird: false,
          treeIndex: index
        });
      });
    });
  }

  createTree() {
    const treeGroup = new THREE.Group();

    const trunkHeight = 6 + Math.random() * 2;
    const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.45, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.TREE_TRUNK,
      flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const branchMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.TREE_TRUNK,
      flatShading: true
    });

    const layerCount = 2 + Math.floor(Math.random() * 2);
    const baseY = trunkHeight * 0.55;
    const layerSpacing = (trunkHeight * 0.35) / layerCount;

    for (let layer = 0; layer < layerCount; layer++) {
      const y = baseY + layer * layerSpacing;
      const branchesInLayer = 2 + Math.floor(Math.random() * 2);
      
      const baseAngle = Math.random() * Math.PI * 2;
      const angleStep = (Math.PI * 2) / branchesInLayer;
      
      for (let i = 0; i < branchesInLayer; i++) {
        const angle = baseAngle + i * angleStep + (Math.random() - 0.5) * 0.5;
        const length = 1.0 + Math.random() * 0.8;
        const tiltAngle = 0.3 + Math.random() * 0.3;
        
        const branchGeometry = new THREE.CylinderGeometry(0.06, 0.1, length, 5);
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);
        
        const halfLength = length * 0.5;
        const x = Math.cos(angle) * halfLength;
        const z = Math.sin(angle) * halfLength;
        
        branch.position.set(x, y, z);
        
        const rotationAxis = new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle));
        branch.rotateOnAxis(rotationAxis, tiltAngle);
        
        branch.castShadow = true;
        treeGroup.add(branch);
        
        const tipGeometry = new THREE.SphereGeometry(0.08, 5, 5);
        const tip = new THREE.Mesh(tipGeometry, branchMaterial);
        
        const tipOffset = length * 0.8;
        const tipX = Math.cos(angle) * tipOffset;
        const tipZ = Math.sin(angle) * tipOffset;
        const tipY = y + Math.sin(tiltAngle) * tipOffset * 0.3;
        
        tip.position.set(tipX, tipY, tipZ);
        tip.castShadow = true;
        treeGroup.add(tip);
      }
    }

    const topGeometry = new THREE.SphereGeometry(0.15, 5, 5);
    const top = new THREE.Mesh(topGeometry, branchMaterial);
    top.position.set(0, trunkHeight + 0.3, 0);
    top.castShadow = true;
    treeGroup.add(top);

    return treeGroup;
  }

  getTreeBranchPositions(tree) {
    const branches = [];
    const treeWorldPos = new THREE.Vector3();
    tree.getWorldPosition(treeWorldPos);
    const scale = tree.scale.x;

    const branchCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < branchCount; i++) {
      const y = (4.5 + Math.random() * 3) * scale;
      const offset = (1.0 + Math.random() * 0.8) * scale;
      const angle = Math.random() * Math.PI * 2;
      
      branches.push({
        position: new THREE.Vector3(
          treeWorldPos.x + Math.cos(angle) * offset,
          treeWorldPos.y + y,
          treeWorldPos.z + Math.sin(angle) * offset
        )
      });
    }

    return branches;
  }

  getAvailableBranches() {
    return this.treeBranches.filter(b => !b.hasBird);
  }

  setBranchOccupied(position, occupied) {
    const branch = this.treeBranches.find(b => 
      b.position.distanceTo(position) < 0.8
    );
    if (branch) {
      branch.hasBird = occupied;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
