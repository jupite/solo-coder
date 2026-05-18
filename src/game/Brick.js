import * as THREE from 'three';

export class Brick {
  constructor(scene, position, color) {
    this.scene = scene;
    this.width = 2;
    this.height = 1;
    this.depth = 1;
    this.position = { ...position };
    this.color = color;
    this.isDestroyed = false;
    this.animationProgress = 0;
    this.isAnimating = false;

    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      metalness: 0.4,
      roughness: 0.3,
      emissive: this.color,
      emissiveIntensity: 0.1
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    this.mesh.add(edges);

    this.scene.add(this.mesh);
  }

  update(deltaTime) {
    if (this.isAnimating) {
      this.animationProgress += deltaTime * 3;
      const scale = Math.max(0, 1 - this.animationProgress);
      this.mesh.scale.set(scale, scale, scale);
      this.mesh.rotation.x += deltaTime * 5;
      this.mesh.rotation.z += deltaTime * 3;
      this.mesh.material.opacity = Math.max(0, 1 - this.animationProgress);
      this.mesh.material.transparent = true;

      if (this.animationProgress >= 1) {
        this.isDestroyed = true;
      }
    }
  }

  hit() {
    if (!this.isAnimating) {
      this.isAnimating = true;
    }
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export class BrickManager {
  constructor(scene) {
    this.scene = scene;
    this.bricks = [];
    this.colors = [
      0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3,
      0xf38181, 0xaa96da, 0xfcbad3, 0xa8d8ea,
      0xff8b94, 0x98ddca, 0xd5ecc3, 0xffd3b6,
      0xb5ead4, 0xf6e7e7, 0xcaa6f6, 0xffd9c0
    ];
  }

  createBricks(rows = 4, cols = 4) {
    this.clearBricks();

    const startX = -(cols - 1) * 1.2;
    const startZ = -(rows - 1) * 1.2;
    const yPos = 5;

    let colorIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const position = {
          x: startX + col * 2.4,
          y: yPos,
          z: startZ + row * 2.4 - 2
        };
        const color = this.colors[colorIndex % this.colors.length];
        const brick = new Brick(this.scene, position, color);
        this.bricks.push(brick);
        colorIndex++;
      }
    }
  }

  update(deltaTime) {
    this.bricks.forEach(brick => brick.update(deltaTime));
    this.bricks = this.bricks.filter(brick => {
      if (brick.isDestroyed) {
        brick.destroy();
        return false;
      }
      return true;
    });
  }

  checkCollisions(ball) {
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      if (!brick.isAnimating && ball.checkBrickCollision(brick)) {
        brick.hit();
        return true;
      }
    }
    return false;
  }

  getRemainingBricks() {
    return this.bricks.filter(b => !b.isAnimating).length;
  }

  clearBricks() {
    this.bricks.forEach(brick => brick.destroy());
    this.bricks = [];
  }
}
