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

    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 7, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.TREE_TRUNK,
      flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const branchData = [
      { y: 4.5, length: 1.4, angle: 0 },
      { y: 4.5, length: 1.4, angle: Math.PI },
      { y: 5.5, length: 1.2, angle: 0 },
      { y: 5.5, length: 1.2, angle: Math.PI },
      { y: 6.5, length: 0.9, angle: 0 },
      { y: 6.5, length: 0.9, angle: Math.PI }
    ];

    const branchMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.TREE_TRUNK,
      flatShading: true
    });

    branchData.forEach((data, index) => {
      const branchGeometry = new THREE.CylinderGeometry(0.08, 0.12, data.length, 5);
      const branch = new THREE.Mesh(branchGeometry, branchMaterial);
      
      const x = Math.cos(data.angle) * data.length * 0.5;
      const z = Math.sin(data.angle) * data.length * 0.5;
      
      branch.position.set(x, data.y, z);
      branch.rotation.z = Math.cos(data.angle) * Math.PI / 2;
      branch.rotation.x = Math.sin(data.angle) * Math.PI / 2;
      
      branch.castShadow = true;
      treeGroup.add(branch);
      
      const endGeometry = new THREE.SphereGeometry(0.1, 6, 6);
      const end = new THREE.Mesh(endGeometry, branchMaterial);
      end.position.set(
        Math.cos(data.angle) * data.length,
        data.y,
        Math.sin(data.angle) * data.length
      );
      end.castShadow = true;
      treeGroup.add(end);
    });

    const topGeometry = new THREE.SphereGeometry(0.2, 6, 6);
    const top = new THREE.Mesh(topGeometry, branchMaterial);
    top.position.set(0, 7.2, 0);
    top.castShadow = true;
    treeGroup.add(top);

    return treeGroup;
  }

  getTreeBranchPositions(tree) {
    const branches = [];
    const treeWorldPos = new THREE.Vector3();
    tree.getWorldPosition(treeWorldPos);
    const scale = tree.scale.x;

    const branchPositions = [
      { y: 4.5, offset: 1.4 },
      { y: 5.5, offset: 1.2 },
      { y: 6.5, offset: 0.9 }
    ];

    branchPositions.forEach(branch => {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI) {
        branches.push({
          position: new THREE.Vector3(
            treeWorldPos.x + Math.cos(angle) * branch.offset * scale,
            treeWorldPos.y + branch.y * scale + 0.2,
            treeWorldPos.z + Math.sin(angle) * branch.offset * scale
          )
        });
      }
    });

    return branches;
  }

  getAvailableBranches() {
    return this.treeBranches.filter(b => !b.hasBird);
  }

  setBranchOccupied(position, occupied) {
    const branch = this.treeBranches.find(b => 
      b.position.distanceTo(position) < 0.5
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
