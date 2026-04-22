class Shape {
    constructor(renderer, positions, colors, normals, indices) {
        this.renderer = renderer;
        this.positionBuffer = renderer.createBuffer(positions);
        this.colorBuffer = renderer.createBuffer(colors);
        this.normalBuffer = renderer.createBuffer(normals);
        this.indexBuffer = renderer.createIndexBuffer(indices);
        this.vertexCount = indices.length;
    }
}

class Cube extends Shape {
    constructor(renderer, color, size = 1) {
        const s = size / 2;
        const positions = [
            -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
            -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s, -s,
            -s,  s, -s, -s,  s,  s,  s,  s,  s,  s,  s, -s,
            -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
             s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
            -s, -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s,
        ];

        const colors = [];
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

class Sphere extends Shape {
    constructor(renderer, color, radius = 0.5, segments = 16) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

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

class Cylinder extends Shape {
    constructor(renderer, color, radius = 0.5, height = 1, segments = 16) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

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

class Cone extends Shape {
    constructor(renderer, color, radius = 0.5, height = 1, segments = 16) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

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

class Torus extends Shape {
    constructor(renderer, color, outerRadius = 0.5, innerRadius = 0.2, segments = 16, ringSegments = 16) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

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

class CompositeShape extends Shape {
    constructor(renderer, shapes) {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];
        let indexOffset = 0;

        for (const shapeData of shapes) {
            const shape = shapeData.shape;
            const transform = shapeData.transform || renderer.identityMatrix();
            
            const gl = renderer.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, shape.positionBuffer);
            const positionData = new Float32Array(shape.vertexCount * 3);
            gl.getBufferSubData(gl.ARRAY_BUFFER, 0, positionData);

            gl.bindBuffer(gl.ARRAY_BUFFER, shape.colorBuffer);
            const colorData = new Float32Array(shape.vertexCount * 4);
            gl.getBufferSubData(gl.ARRAY_BUFFER, 0, colorData);

            gl.bindBuffer(gl.ARRAY_BUFFER, shape.normalBuffer);
            const normalData = new Float32Array(shape.vertexCount * 3);
            gl.getBufferSubData(gl.ARRAY_BUFFER, 0, normalData);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
            const indexData = new Uint16Array(shape.vertexCount);
            gl.getBufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indexData);

            for (let i = 0; i < shape.vertexCount; i++) {
                const x = positionData[i * 3];
                const y = positionData[i * 3 + 1];
                const z = positionData[i * 3 + 2];

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
                    colorData[i * 4],
                    colorData[i * 4 + 1],
                    colorData[i * 4 + 2],
                    colorData[i * 4 + 3]
                );

                normals.push(
                    normalData[i * 3],
                    normalData[i * 3 + 1],
                    normalData[i * 3 + 2]
                );
            }

            for (let i = 0; i < shape.vertexCount; i++) {
                indices.push(indexData[i] + indexOffset);
            }

            indexOffset += shape.vertexCount;
        }

        super(renderer, positions, colors, normals, indices);
    }
}
