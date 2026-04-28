export class WebGLRenderer {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext | null;
    programs: Record<string, WebGLProgram>;
    
    vertexPositionAttribute: number;
    vertexColorAttribute: number;
    vertexNormalAttribute: number;
    
    modelViewMatrixUniform: WebGLUniformLocation | null;
    projectionMatrixUniform: WebGLUniformLocation | null;
    normalMatrixUniform: WebGLUniformLocation | null;
    
    lightPositionUniform: WebGLUniformLocation | null;
    lightColorUniform: WebGLUniformLocation | null;
    ambientStrengthUniform: WebGLUniformLocation | null;
    diffuseStrengthUniform: WebGLUniformLocation | null;
    specularStrengthUniform: WebGLUniformLocation | null;
    shininessUniform: WebGLUniformLocation | null;
    
    modelViewMatrix: Float32Array;
    projectionMatrix: Float32Array;
    normalMatrix: Float32Array;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl', { alpha: false, antialias: true }) as WebGLRenderingContext || 
                  canvas.getContext('experimental-webgl', { alpha: false, antialias: true }) as WebGLRenderingContext;
        if (!this.gl) {
            throw new Error('WebGL 不支持');
        }
        this.programs = {};
        this.initShaders();
        this.initMatrices();
    }

    private initShaders(): void {
        const vertexShaderSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            attribute vec3 aVertexNormal;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat3 uNormalMatrix;
            
            varying vec4 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
                vNormal = uNormalMatrix * aVertexNormal;
                vPosition = (uModelViewMatrix * aVertexPosition).xyz;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec4 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            uniform vec3 uLightPosition;
            uniform vec3 uLightColor;
            uniform float uAmbientStrength;
            uniform float uDiffuseStrength;
            uniform float uSpecularStrength;
            uniform float uShininess;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(uLightPosition - vPosition);
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, normal);
                
                vec3 ambient = uAmbientStrength * uLightColor;
                
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = uDiffuseStrength * diff * uLightColor;
                
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
                vec3 specular = uSpecularStrength * spec * uLightColor;
                
                vec3 result = (ambient + diffuse + specular) * vColor.rgb;
                gl_FragColor = vec4(result, vColor.a);
            }
        `;

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('着色器程序链接失败: ' + this.gl.getProgramInfoLog(program));
        }

        this.programs.main = program;
        
        this.vertexPositionAttribute = this.gl.getAttribLocation(program, 'aVertexPosition');
        this.vertexColorAttribute = this.gl.getAttribLocation(program, 'aVertexColor');
        this.vertexNormalAttribute = this.gl.getAttribLocation(program, 'aVertexNormal');
        
        this.modelViewMatrixUniform = this.gl.getUniformLocation(program, 'uModelViewMatrix');
        this.projectionMatrixUniform = this.gl.getUniformLocation(program, 'uProjectionMatrix');
        this.normalMatrixUniform = this.gl.getUniformLocation(program, 'uNormalMatrix');
        
        this.lightPositionUniform = this.gl.getUniformLocation(program, 'uLightPosition');
        this.lightColorUniform = this.gl.getUniformLocation(program, 'uLightColor');
        this.ambientStrengthUniform = this.gl.getUniformLocation(program, 'uAmbientStrength');
        this.diffuseStrengthUniform = this.gl.getUniformLocation(program, 'uDiffuseStrength');
        this.specularStrengthUniform = this.gl.getUniformLocation(program, 'uSpecularStrength');
        this.shininessUniform = this.gl.getUniformLocation(program, 'uShininess');
    }

    private compileShader(type: number, source: string): WebGLShader {
        const shader = this.gl!.createShader(type);
        this.gl!.shaderSource(shader, source);
        this.gl!.compileShader(shader);

        if (!this.gl!.getShaderParameter(shader, this.gl!.COMPILE_STATUS)) {
            const info = this.gl!.getShaderInfoLog(shader);
            this.gl!.deleteShader(shader);
            throw new Error('着色器编译失败: ' + info);
        }

        return shader;
    }

    private initMatrices(): void {
        this.modelViewMatrix = this.identityMatrix();
        this.projectionMatrix = this.identityMatrix();
        this.normalMatrix = this.identityMatrix();
    }

    identityMatrix(): Float32Array {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    perspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
    }

    orthographicMatrix(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array {
        return new Float32Array([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,
            -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
        ]);
    }

    multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
        const result = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[i * 4 + k] * b[k * 4 + j];
                }
                result[i * 4 + j] = sum;
            }
        }
        return result;
    }

    translateMatrix(x: number, y: number, z: number): Float32Array {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    scaleMatrix(x: number, y: number, z: number): Float32Array {
        return new Float32Array([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    rotateXMatrix(angle: number): Float32Array {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Float32Array([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    }

    rotateYMatrix(angle: number): Float32Array {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Float32Array([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }

    rotateZMatrix(angle: number): Float32Array {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Float32Array([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    lookAt(eye: number[], target: number[], up: number[]): Float32Array {
        const zAxis = this.normalize([
            eye[0] - target[0],
            eye[1] - target[1],
            eye[2] - target[2]
        ]);
        const xAxis = this.normalize(this.cross(up, zAxis));
        const yAxis = this.cross(zAxis, xAxis);

        return new Float32Array([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
        ]);
    }

    private normalize(v: number[]): number[] {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    private cross(a: number[], b: number[]): number[] {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    private dot(a: number[], b: number[]): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    createBuffer(data: number[]): WebGLBuffer {
        const buffer = this.gl!.createBuffer();
        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, buffer);
        this.gl!.bufferData(this.gl!.ARRAY_BUFFER, new Float32Array(data), this.gl!.STATIC_DRAW);
        return buffer;
    }

    createIndexBuffer(indices: number[]): WebGLBuffer {
        const buffer = this.gl!.createBuffer();
        this.gl!.bindBuffer(this.gl!.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl!.bufferData(this.gl!.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl!.STATIC_DRAW);
        return buffer;
    }

    clear(r: number, g: number, b: number, a: number): void {
        this.gl!.clearColor(r, g, b, a);
        this.gl!.clearDepth(1.0);
        this.gl!.enable(this.gl!.DEPTH_TEST);
        this.gl!.depthFunc(this.gl!.LEQUAL);
        this.gl!.clear(this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT);
    }

    setViewport(width: number, height: number): void {
        this.gl!.viewport(0, 0, width, height);
    }

    useProgram(): void {
        this.gl!.useProgram(this.programs.main);
    }

    setLighting(lightPosition: number[], lightColor: number[], ambient: number, diffuse: number, specular: number, shininess: number): void {
        this.gl!.uniform3fv(this.lightPositionUniform, lightPosition);
        this.gl!.uniform3fv(this.lightColorUniform, lightColor);
        this.gl!.uniform1f(this.ambientStrengthUniform, ambient);
        this.gl!.uniform1f(this.diffuseStrengthUniform, diffuse);
        this.gl!.uniform1f(this.specularStrengthUniform, specular);
        this.gl!.uniform1f(this.shininessUniform, shininess);
    }

    drawShape(shape: Shape, modelMatrix: Float32Array): void {
        const mvMatrix = this.multiplyMatrices(this.modelViewMatrix, modelMatrix);
        const pMatrix = this.projectionMatrix;
        
        const normalMatrix = new Float32Array([
            mvMatrix[0], mvMatrix[1], mvMatrix[2],
            mvMatrix[4], mvMatrix[5], mvMatrix[6],
            mvMatrix[8], mvMatrix[9], mvMatrix[10]
        ]);

        this.gl!.uniformMatrix4fv(this.modelViewMatrixUniform, false, mvMatrix);
        this.gl!.uniformMatrix4fv(this.projectionMatrixUniform, false, pMatrix);
        this.gl!.uniformMatrix3fv(this.normalMatrixUniform, false, normalMatrix);

        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, shape.positionBuffer);
        this.gl!.enableVertexAttribArray(this.vertexPositionAttribute);
        this.gl!.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl!.FLOAT, false, 0, 0);

        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, shape.colorBuffer);
        this.gl!.enableVertexAttribArray(this.vertexColorAttribute);
        this.gl!.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl!.FLOAT, false, 0, 0);

        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, shape.normalBuffer);
        this.gl!.enableVertexAttribArray(this.vertexNormalAttribute);
        this.gl!.vertexAttribPointer(this.vertexNormalAttribute, 3, this.gl!.FLOAT, false, 0, 0);

        this.gl!.bindBuffer(this.gl!.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
        this.gl!.drawElements(this.gl!.TRIANGLES, shape.vertexCount, this.gl!.UNSIGNED_SHORT, 0);
    }

    resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setViewport(width, height);
    }
}

export interface Shape {
    positionBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    vertexCount: number;
}