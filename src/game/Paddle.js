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

  update(deltaTime, input) {
    let moveX = 0;
    let moveZ = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.forward) moveZ -= 1;
    if (input.backward) moveZ += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
    }

    this.position.x += moveX * this.speed * deltaTime;
    this.position.z += moveZ * this.speed * deltaTime;

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

    const tiltX = -moveX * 0.15;
    const tiltZ = moveZ * 0.15;
    this.mesh.rotation.x = tiltZ;
    this.mesh.rotation.z = tiltX;
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
