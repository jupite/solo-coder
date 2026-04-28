import { WebGLRenderer, Shape as RendererShape } from './renderer';

export class Shape implements RendererShape {
    positionBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    vertexCount: number;
    positions: number[];
    colors: number[];
    normals: number[];
    indices: number[];

    constructor(renderer: WebGLRenderer, positions: number[], colors: number[], normals: number[], indices: number[]) {
        this.positions = positions;
        this.colors = colors;
        this.normals = normals;
        this.indices = indices;
        this.positionBuffer = renderer.createBuffer(positions);
        this.colorBuffer = renderer.createBuffer(colors);
        this.normalBuffer = renderer.createBuffer(normals);
        this.indexBuffer = renderer.createIndexBuffer(indices);
        this.vertexCount = indices.length;
    }
}

export class Cube extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], size: number = 1) {
        const s = size / 2;
        const positions = [
            -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
            -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s, -s,
            -s,  s, -s, -s,  s,  s,  s,  s,  s,  s,  s, -s,
            -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
             s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
            -s, -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s,
        ];

        const colors: number[] = [];
        for (let i = 0; i < 24; i++) {
            colors.push(color[0], color[1], color[2], color[3]);
        }

        const normals = [
            0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
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
    constructor(renderer: WebGLRenderer, color: number[], radius: number = 0.5, segments: number = 16) {
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
    constructor(renderer: WebGLRenderer, color: number[], radius: number = 0.5, height: number = 1, segments: number = 16) {
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
    constructor(renderer: WebGLRenderer, color: number[], radius: number = 0.5, height: number = 1, segments: number = 16) {
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
    constructor(renderer: WebGLRenderer, color: number[], outerRadius: number = 0.5, innerRadius: number = 0.2, segments: number = 16, ringSegments: number = 16) {
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

export class Ellipsoid extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], radiusX: number = 0.5, radiusY: number = 0.5, radiusZ: number = 0.5, segments: number = 16) {
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

                positions.push(radiusX * x, radiusY * y, radiusZ * z);
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

export class LightningTail extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], size: number = 1.0) {
        const positions: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];

        const points = [
            { x: 0, y: 0, z: 0 },
            { x: 0.3 * size, y: 0.2 * size, z: 0 },
            { x: 0.1 * size, y: 0.4 * size, z: 0 },
            { x: 0.4 * size, y: 0.6 * size, z: 0 },
            { x: 0.2 * size, y: 0.8 * size, z: 0 },
            { x: 0.5 * size, y: 1.0 * size, z: 0 },
            { x: 0.3 * size, y: 1.1 * size, z: 0 },
            { x: 0.1 * size, y: 0.9 * size, z: 0 },
            { x: -0.1 * size, y: 1.0 * size, z: 0 },
            { x: 0.1 * size, y: 0.7 * size, z: 0 },
            { x: -0.1 * size, y: 0.5 * size, z: 0 },
            { x: 0.1 * size, y: 0.3 * size, z: 0 },
            { x: -0.1 * size, y: 0.1 * size, z: 0 },
        ];

        const thickness = 0.08 * size;
        const vertexCount = points.length;

        for (let i = 0; i < vertexCount; i++) {
            const p = points[i];
            const nextP = points[(i + 1) % vertexCount];
            const prevP = points[(i - 1 + vertexCount) % vertexCount];

            let dirX = nextP.x - prevP.x;
            let dirY = nextP.y - prevP.y;
            const len = Math.sqrt(dirX * dirX + dirY * dirY);
            if (len > 0) {
                dirX /= len;
                dirY /= len;
            }
            const perpX = -dirY;
            const perpY = dirX;

            positions.push(p.x + perpX * thickness, p.y + perpY * thickness, 0.05);
            positions.push(p.x - perpX * thickness, p.y - perpY * thickness, 0.05);
            positions.push(p.x + perpX * thickness, p.y + perpY * thickness, -0.05);
            positions.push(p.x - perpX * thickness, p.y - perpY * thickness, -0.05);

            for (let j = 0; j < 4; j++) {
                colors.push(color[0], color[1], color[2], color[3]);
                normals.push(0, 0, 1);
            }
        }

        for (let i = 0; i < vertexCount - 1; i++) {
            const base = i * 4;
            const nextBase = (i + 1) * 4;

            indices.push(base, base + 1, nextBase);
            indices.push(base + 1, nextBase + 1, nextBase);
            indices.push(base + 2, nextBase + 2, base + 3);
            indices.push(base + 3, nextBase + 2, nextBase + 3);
            indices.push(base, base + 2, nextBase);
            indices.push(base + 2, nextBase + 2, nextBase);
            indices.push(base + 1, nextBase + 1, base + 3);
            indices.push(base + 3, nextBase + 1, nextBase + 3);
        }

        super(renderer, positions, colors, normals, indices);
    }
}

export class Flame extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], size: number = 1.0, segments: number = 8) {
        const positions: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];

        const flamePoints = [
            { x: 0, y: 0, z: 0, r: 0.3 * size },
            { x: 0, y: 0.15 * size, z: 0, r: 0.25 * size },
            { x: 0.1 * size, y: 0.35 * size, z: 0, r: 0.2 * size },
            { x: -0.05 * size, y: 0.5 * size, z: 0, r: 0.12 * size },
            { x: 0.05 * size, y: 0.7 * size, z: 0, r: 0.08 * size },
            { x: 0, y: 0.9 * size, z: 0, r: 0.03 * size },
        ];

        for (let i = 0; i < flamePoints.length; i++) {
            const point = flamePoints[i];
            const colorFactor = 1 - (i / flamePoints.length) * 0.5;
            
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = point.x + Math.cos(angle) * point.r;
                const y = point.y;
                const z = point.z + Math.sin(angle) * point.r;

                positions.push(x, y, z);
                colors.push(color[0] * colorFactor, color[1] * colorFactor, color[2] * colorFactor, color[3]);
                
                const nx = Math.cos(angle);
                const ny = 0.5;
                const nz = Math.sin(angle);
                const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
                normals.push(nx / nLen, ny / nLen, nz / nLen);
            }
        }

        for (let i = 0; i < flamePoints.length - 1; i++) {
            for (let j = 0; j < segments; j++) {
                const base = i * (segments + 1) + j;
                const nextBase = (i + 1) * (segments + 1) + j;

                indices.push(base, nextBase, base + 1);
                indices.push(nextBase, nextBase + 1, base + 1);
            }
        }

        super(renderer, positions, colors, normals, indices);
    }
}

export class Wing extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], size: number = 1.0, segments: number = 8) {
        const positions: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];

        const wingCurve = [
            { x: 0, y: 0, z: 0 },
            { x: 0.2 * size, y: 0.1 * size, z: 0.1 * size },
            { x: 0.5 * size, y: 0.2 * size, z: 0.2 * size },
            { x: 0.8 * size, y: 0.15 * size, z: 0.15 * size },
            { x: 1.0 * size, y: 0.05 * size, z: 0 },
        ];

        const thickness = 0.05 * size;

        for (let i = 0; i < wingCurve.length; i++) {
            const p = wingCurve[i];
            const t = i / (wingCurve.length - 1);
            const localThickness = thickness * (1 - t * 0.8);

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = p.x;
                const y = p.y + Math.cos(angle) * localThickness;
                const z = p.z + Math.sin(angle) * localThickness;

                positions.push(x, y, z);
                colors.push(color[0], color[1], color[2], color[3]);
                
                const nx = 0;
                const ny = Math.cos(angle);
                const nz = Math.sin(angle);
                normals.push(nx, ny, nz);
            }
        }

        for (let i = 0; i < wingCurve.length - 1; i++) {
            for (let j = 0; j < segments; j++) {
                const base = i * (segments + 1) + j;
                const nextBase = (i + 1) * (segments + 1) + j;

                indices.push(base, nextBase, base + 1);
                indices.push(nextBase, nextBase + 1, base + 1);
            }
        }

        super(renderer, positions, colors, normals, indices);
    }
}

export class Shell extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], size: number = 1.0, segments: number = 12) {
        const positions: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];

        for (let lat = 0; lat <= segments / 2; lat++) {
            const theta = lat * Math.PI / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= segments; long++) {
                const phi = long * 2 * Math.PI / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta * 0.6;
                const z = sinPhi * sinTheta;

                positions.push(x * size * 0.5, y * size * 0.5, z * size * 0.5);
                colors.push(color[0], color[1], color[2], color[3]);
                normals.push(x, y, z);
            }
        }

        for (let lat = 0; lat < segments / 2; lat++) {
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

export class PlantBulb extends Shape {
    constructor(renderer: WebGLRenderer, color: number[], secondaryColor: number[], size: number = 1.0, segments: number = 12) {
        const positions: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];

        const leafCount = 6;
        for (let leaf = 0; leaf < leafCount; leaf++) {
            const leafAngle = (leaf / leafCount) * Math.PI * 2;
            const leafTilt = 0.3;
            
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const leafWidth = (1 - t * t) * 0.3 * size;
                const leafHeight = t * 0.8 * size;
                const curveX = Math.sin(t * Math.PI) * 0.1 * size;

                for (let j = 0; j <= 4; j++) {
                    const s = j / 4;
                    const width = leafWidth * (1 - s * 0.5);
                    
                    const localX = curveX + (s - 0.5) * width;
                    const localY = leafHeight;
                    const localZ = 0;

                    const rotatedX = localX * Math.cos(leafAngle) - localZ * Math.sin(leafAngle);
                    const rotatedZ = localX * Math.sin(leafAngle) + localZ * Math.cos(leafAngle);
                    const tiltedY = localY * Math.cos(leafTilt);
                    const tiltedZ = rotatedZ + localY * Math.sin(leafTilt);

                    positions.push(rotatedX, tiltedY, tiltedZ);
                    
                    const colorMix = t * 0.5 + s * 0.3;
                    colors.push(
                        color[0] * (1 - colorMix) + secondaryColor[0] * colorMix,
                        color[1] * (1 - colorMix) + secondaryColor[1] * colorMix,
                        color[2] * (1 - colorMix) + secondaryColor[2] * colorMix,
                        1.0
                    );
                    normals.push(0, 1, 0);
                }
            }

            const leafBase = leaf * (segments + 1) * 5;
            for (let i = 0; i < segments; i++) {
                for (let j = 0; j < 4; j++) {
                    const base = leafBase + i * 5 + j;
                    const nextBase = leafBase + (i + 1) * 5 + j;
                    indices.push(base, nextBase, base + 1);
                    indices.push(nextBase, nextBase + 1, base + 1);
                }
            }
        }

        super(renderer, positions, colors, normals, indices);
    }
}

export class CompositeShape extends Shape {
    constructor(renderer: WebGLRenderer, shapes: { shape: Shape; transform?: Float32Array }[]) {
        const positions: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        let indexOffset = 0;

        for (const shapeData of shapes) {
            const shape = shapeData.shape;
            const transform = shapeData.transform || renderer.identityMatrix();

            for (let i = 0; i < shape.vertexCount; i++) {
                const x = shape.positions[i * 3];
                const y = shape.positions[i * 3 + 1];
                const z = shape.positions[i * 3 + 2];

                const transformed = renderer.multiplyMatrices(
                    transform,
                    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
                );

                positions.push(
                    transformed[12],
                    transformed[13],
                    transformed[14]
                );

                colors.push(
                    shape.colors[i * 4],
                    shape.colors[i * 4 + 1],
                    shape.colors[i * 4 + 2],
                    shape.colors[i * 4 + 3]
                );

                const normal = renderer.multiplyMatrices(
                    transform,
                    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shape.normals[i * 3], shape.normals[i * 3 + 1], shape.normals[i * 3 + 2], 0])
                );

                const length = Math.sqrt(normal[12] * normal[12] + normal[13] * normal[13] + normal[14] * normal[14]);
                normals.push(
                    normal[12] / length,
                    normal[13] / length,
                    normal[14] / length
                );
            }

            for (let i = 0; i < shape.indices.length; i++) {
                indices.push(shape.indices[i] + indexOffset);
            }

            indexOffset += shape.vertexCount;
        }

        super(renderer, positions, colors, normals, indices);
    }
}