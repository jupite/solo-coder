import * as THREE from 'three';

export class BlockRenderer {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.blockMeshes = new Map();
    this.cutParts = [];
  }

  createBlockMesh(block) {
    const geometry = new THREE.BoxGeometry(block.size.x, block.size.y, block.size.z);
    const material = new THREE.MeshStandardMaterial({
      color: block.color,
      roughness: 0.4,
      metalness: 0.3,
      transparent: false,
      opacity: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(block.position.x, block.position.y, block.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    mesh.add(edges);

    this.blockMeshes.set(block.id, mesh);
    this.sceneManager.add(mesh);

    return mesh;
  }

  updateBlockMesh(block) {
    const mesh = this.blockMeshes.get(block.id);
    if (!mesh) return;

    mesh.position.set(block.position.x, block.position.y, block.position.z);

    if (!block.isMoving) {
      mesh.scale.set(block.size.x / mesh.geometry.parameters.width, 1, block.size.z / mesh.geometry.parameters.depth);
    }
  }

  updateMovingBlock(block) {
    const mesh = this.blockMeshes.get(block.id);
    if (!mesh) return;
    mesh.position.set(block.position.x, block.position.y, block.position.z);
  }

  createCutParts(parts, color) {
    parts.forEach(part => {
      const geometry = new THREE.BoxGeometry(part.size.x, part.size.y, part.size.z);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3,
        transparent: true,
        opacity: 0.7
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(part.position.x, part.position.y, part.position.z);
      mesh.castShadow = true;

      this.sceneManager.add(mesh);
      this.cutParts.push({
        mesh,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: 3,
          z: (Math.random() - 0.5) * 2
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
          z: (Math.random() - 0.5) * 4
        },
        lifetime: 1.5,
        age: 0
      });
    });
  }

  updateCutParts(deltaTime) {
    for (let i = this.cutParts.length - 1; i >= 0; i--) {
      const part = this.cutParts[i];
      part.age += deltaTime;

      if (part.age >= part.lifetime) {
        this.sceneManager.remove(part.mesh);
        part.mesh.geometry.dispose();
        part.mesh.material.dispose();
        this.cutParts.splice(i, 1);
        continue;
      }

      part.velocity.y -= 9.8 * deltaTime;
      part.mesh.position.x += part.velocity.x * deltaTime;
      part.mesh.position.y += part.velocity.y * deltaTime;
      part.mesh.position.z += part.velocity.z * deltaTime;

      part.mesh.rotation.x += part.rotationSpeed.x * deltaTime;
      part.mesh.rotation.y += part.rotationSpeed.y * deltaTime;
      part.mesh.rotation.z += part.rotationSpeed.z * deltaTime;

      const opacity = 1 - (part.age / part.lifetime);
      part.mesh.material.opacity = opacity * 0.7;
    }
  }

  removeBlock(block) {
    const mesh = this.blockMeshes.get(block.id);
    if (mesh) {
      this.sceneManager.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.blockMeshes.delete(block.id);
    }
  }

  clearAll() {
    this.blockMeshes.forEach(mesh => {
      this.sceneManager.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.blockMeshes.clear();

    this.cutParts.forEach(part => {
      this.sceneManager.remove(part.mesh);
      part.mesh.geometry.dispose();
      part.mesh.material.dispose();
    });
    this.cutParts = [];
  }
}
