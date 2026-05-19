import * as THREE from 'three';
import { fbm, smoothStep } from '../utils/math.js';

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.size = 2000;
    this.segments = 256;
    this.heightScale = 150;
    this.noiseScale = 0.003;
    this.heightMap = null;
    this.mesh = null;
  }

  generate() {
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.segments,
      this.segments
    );
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    this.heightMap = new Float32Array((this.segments + 1) * (this.segments + 1));

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      let height = 0;
      height += fbm(x * this.noiseScale, z * this.noiseScale, 6, 2, 0.5) * 0.6;
      height += fbm(x * this.noiseScale * 3, z * this.noiseScale * 3, 3, 2, 0.5) * 0.3;
      height += fbm(x * this.noiseScale * 8, z * this.noiseScale * 8, 2, 2, 0.5) * 0.1;

      height = (height + 1) / 2;
      height = Math.pow(height, 1.5);

      const distFromCenter = Math.sqrt(x * x + z * z) / (this.size / 2);
      const falloff = smoothStep(1, 0.3, distFromCenter);
      height *= falloff;

      const finalHeight = height * this.heightScale;
      positions.setY(i, finalHeight);
      this.heightMap[i] = finalHeight;
    }

    geometry.computeVertexNormals();

    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const normalizedHeight = y / this.heightScale;

      let r, g, b;
      if (normalizedHeight < 0.2) {
        r = 0.3; g = 0.5; b = 0.2;
      } else if (normalizedHeight < 0.5) {
        r = 0.35; g = 0.45; b = 0.2;
      } else if (normalizedHeight < 0.75) {
        r = 0.5; g = 0.45; b = 0.35;
      } else {
        r = 0.9; g = 0.9; b = 0.95;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  getHeight(x, z) {
    if (!this.heightMap) return 0;

    const halfSize = this.size / 2;
    const gx = (x + halfSize) / this.size;
    const gz = (z + halfSize) / this.size;

    if (gx < 0 || gx > 1 || gz < 0 || gz > 1) {
      return 0;
    }

    const ix = Math.floor(gx * this.segments);
    const iz = Math.floor(gz * this.segments);
    const fx = (gx * this.segments) - ix;
    const fz = (gz * this.segments) - iz;

    const idx = (row, col) => row * (this.segments + 1) + col;

    const h00 = this.heightMap[idx(iz, ix)];
    const h10 = this.heightMap[idx(iz, Math.min(ix + 1, this.segments))];
    const h01 = this.heightMap[idx(Math.min(iz + 1, this.segments), ix)];
    const h11 = this.heightMap[idx(Math.min(iz + 1, this.segments), Math.min(ix + 1, this.segments))];

    const h0 = h00 * (1 - fx) + h10 * fx;
    const h1 = h01 * (1 - fx) + h11 * fx;

    return h0 * (1 - fz) + h1 * fz;
  }

  getStartPosition() {
    return new THREE.Vector3(0, this.heightScale * 0.9 + 100, 0);
  }
}
