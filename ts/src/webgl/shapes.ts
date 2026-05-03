import type { WebGLRenderer } from './renderer';

export class Shape {
  renderer: WebGLRenderer;
  positionBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vertexCount: number;

  constructor(renderer: WebGLRenderer, positions: number[], colors: number[], normals: number[], indices: number[]) {
    this.renderer = renderer;
    this.positionBuffer = renderer.createBuffer(positions);
    this.colorBuffer = renderer.createBuffer(colors);
    this.normalBuffer = renderer.createBuffer(normals);
    this.indexBuffer = renderer.createIndexBuffer(indices);
    this.vertexCount = indices.length;
  }
}

export class Cube extends Shape {
  constructor(renderer: WebGLRenderer, color: [number, number, number, number], size: number = 1) {
    const s = size / 2;
    const positions = [
      -s, -s, s, s, -s, s, s, s, s, -s, s, s,
      -s, -s, -s, -s, s, -s, s, s, -s, s, -s, -s,
      -s, s, -s, -s, s, s, s, s, s, s, s, -s,
      -s, -s, -s, s, -s, -s, s, -s, s, -s, -s, s,
      s, -s, -s, s, s, -s, s, s, s, s, -s, s,
      -s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s,
    ];

    const colors: number[] = [];
    for (let i = 0; i < 24; i++) {
      colors.push(color[0], color[1], color[2], color[3]);
    }

    const normals = [
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ];

    const indices = [
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      8, 9, 10, 8, 10, 11,
      12, 13, 14, 12, 14, 15,
      16, 17, 18, 16, 18, 19,
      20, 21, 22, 20, 22, 23,
    ];

    super(renderer, positions, colors, normals, indices);
  }
}

export class Sphere extends Shape {
  constructor(renderer: WebGLRenderer, color: [number, number, number, number], radius: number = 0.5, segments: number = 16) {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let lat = 0; lat <= segments; lat++) {
      const theta = lat * Math.PI / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let long = 0; long <= segments; long++) {
        const phi = long * 2 * Math.PI / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        positions.push(radius * x, radius * y, radius * z);
        colors.push(color[0], color[1], color[2], color[3]);
        normals.push(x, y, z);
      }
    }

    for (let lat = 0; lat < segments; lat++) {
      for (let long = 0; long < segments; long++) {
        const first = lat * (segments + 1) + long;
        const second = first + segments + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    super(renderer, positions, colors, normals, indices);
  }
}

export class Cylinder extends Shape {
  constructor(renderer: WebGLRenderer, color: [number, number, number, number], radius: number = 0.5, height: number = 1, segments: number = 16) {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = i * 2 * Math.PI / segments;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      positions.push(radius * cos, 0, radius * sin);
      colors.push(color[0], color[1], color[2], color[3]);
      normals.push(cos, 0, sin);

      positions.push(radius * cos, height, radius * sin);
      colors.push(color[0], color[1], color[2], color[3]);
      normals.push(cos, 0, sin);
    }

    for (let i = 0; i < segments; i++) {
      const first = i * 2;
      const second = first + 1;
      const third = first + 2;
      const fourth = first + 3;

      indices.push(first, second, third);
      indices.push(second, fourth, third);
    }

    positions.push(0, 0, 0);
    colors.push(color[0], color[1], color[2], color[3]);
    normals.push(0, -1, 0);

    positions.push(0, height, 0);
    colors.push(color[0], color[1], color[2], color[3]);
    normals.push(0, 1, 0);

    const topCenter = (segments + 1) * 2;
    const bottomCenter = topCenter + 1;

    for (let i = 0; i < segments; i++) {
      const first = i * 2;
      const second = first + 2;

      indices.push(topCenter, first, second);
      indices.push(bottomCenter, second + 1, first + 1);
    }

    super(renderer, positions, colors, normals, indices);
  }
}

export class Cone extends Shape {
  constructor(renderer: WebGLRenderer, color: [number, number, number, number], radius: number = 0.5, height: number = 1, segments: number = 16) {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = i * 2 * Math.PI / segments;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      positions.push(radius * cos, 0, radius * sin);
      colors.push(color[0], color[1], color[2], color[3]);

      const ny = radius / Math.sqrt(radius * radius + height * height);
      const nxz = height / Math.sqrt(radius * radius + height * height);
      normals.push(cos * nxz, ny, sin * nxz);
    }

    positions.push(0, height, 0);
    colors.push(color[0], color[1], color[2], color[3]);
    normals.push(0, 1, 0);

    positions.push(0, 0, 0);
    colors.push(color[0], color[1], color[2], color[3]);
    normals.push(0, -1, 0);

    const topVertex = segments + 1;
    const bottomCenter = segments + 2;

    for (let i = 0; i < segments; i++) {
      indices.push(i, i + 1, topVertex);
      indices.push(bottomCenter, i + 1, i);
    }

    super(renderer, positions, colors, normals, indices);
  }
}

export class Torus extends Shape {
  constructor(renderer: WebGLRenderer, color: [number, number, number, number], outerRadius: number = 0.5, innerRadius: number = 0.2, segments: number = 16, ringSegments: number = 16) {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const u = i * 2 * Math.PI / segments;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      for (let j = 0; j <= ringSegments; j++) {
        const v = j * 2 * Math.PI / ringSegments;
        const cosV = Math.cos(v);
        const sinV = Math.sin(v);

        const x = (outerRadius + innerRadius * cosV) * cosU;
        const y = innerRadius * sinV;
        const z = (outerRadius + innerRadius * cosV) * sinU;

        const nx = cosV * cosU;
        const ny = sinV;
        const nz = cosV * sinU;

        positions.push(x, y, z);
        colors.push(color[0], color[1], color[2], color[3]);
        normals.push(nx, ny, nz);
      }
    }

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < ringSegments; j++) {
        const first = i * (ringSegments + 1) + j;
        const second = first + ringSegments + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    super(renderer, positions, colors, normals, indices);
  }
}