import * as THREE from 'three';

export class Paddle {
  constructor(scene, bounds) {
    this.scene = scene;
    this.bounds = bounds;
    this.width = 3;
    this.height = 0.4;
    this.depth = 3;
    this.speed = 12;
    this.position = { x: 0, y: 0.5, z: 0 };

    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshStandardMaterial({
      color: 0x667eea,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x333e7a,
      emissiveIntensity: 0.2
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x9d9eff, linewidth: 2 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    this.mesh.add(edges);

    this.scene.add(this.mesh);
  }

  update(deltaTime, movement) {
    this.position.x += movement.x * this.speed * deltaTime;
    this.position.z += movement.z * this.speed * deltaTime;

    const halfWidth = this.width / 2;
    const halfDepth = this.depth / 2;

    this.position.x = Math.max(
      this.bounds.minX + halfWidth,
      Math.min(this.bounds.maxX - halfWidth, this.position.x)
    );
    this.position.z = Math.max(
      this.bounds.minZ + halfDepth,
      Math.min(this.bounds.maxZ - halfDepth, this.position.z)
    );

    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    const tiltX = -movement.x * 0.15;
    const tiltZ = movement.z * 0.15;
    this.mesh.rotation.x = tiltZ;
    this.mesh.rotation.z = tiltX;
  }

  setWidth(newWidth) {
    this.width = newWidth;
    this.rebuildMesh();
  }

  rebuildMesh() {
    const oldPosition = { ...this.position };
    const oldRotation = { x: this.mesh.rotation.x, z: this.mesh.rotation.z };

    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();

    this.createMesh();

    this.mesh.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
    this.mesh.rotation.x = oldRotation.x;
    this.mesh.rotation.z = oldRotation.z;
  }

  reset() {
    this.position = { x: 0, y: 0.5, z: 0 };
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.rotation.x = 0;
    this.mesh.rotation.z = 0;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
