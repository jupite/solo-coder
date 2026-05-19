import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../config/constants.js';

export class Track {
    constructor(scene) {
        this.scene = scene;
        this.curve = null;
        this.trackMesh = null;
        this.rails = [];
        this.ties = [];
        this.caveWalls = [];
        this.trackLength = 0;
        this.init();
    }

    init() {
        this.createCurve();
        this.createTrack();
        this.createRails();
        this.createTies();
        this.createCave();
    }

    createCurve() {
        const points = [];
        const segments = 20;
        const segmentLength = GAME_CONFIG.TRACK_SEGMENT_LENGTH / segments;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = Math.sin(t * Math.PI * 4) * GAME_CONFIG.CURVE_INTENSITY;
            const y = 0;
            const z = -t * GAME_CONFIG.TRACK_SEGMENT_LENGTH;
            points.push(new THREE.Vector3(x, y, z));
        }

        this.curve = new THREE.CatmullRomCurve3(points);
        this.trackLength = this.curve.getLength();
    }

    createTrack() {
        const points = [];
        const segments = 400;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const centerPoint = this.curve.getPointAt(t);
            const tangent = this.curve.getTangentAt(t).normalize();
            const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
            
            const leftPoint = centerPoint.clone().add(normal.clone().multiplyScalar(GAME_CONFIG.TRACK_WIDTH / 2));
            const rightPoint = centerPoint.clone().add(normal.clone().multiplyScalar(-GAME_CONFIG.TRACK_WIDTH / 2));
            
            points.push(leftPoint, rightPoint);
        }

        const trackGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const uvs = [];
        const indices = [];

        for (let i = 0; i < points.length; i += 2) {
            vertices.push(points[i].x, 0, points[i].z);
            vertices.push(points[i + 1].x, 0, points[i + 1].z);
            uvs.push(i / points.length, 0);
            uvs.push(i / points.length, 1);
        }

        for (let i = 0; i < points.length - 2; i += 2) {
            indices.push(i, i + 1, i + 2);
            indices.push(i + 1, i + 3, i + 2);
        }

        trackGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        trackGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        trackGeometry.setIndex(indices);
        trackGeometry.computeVertexNormals();

        const trackMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.TRACK,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide,
        });

        this.trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
        this.trackMesh.position.y = -GAME_CONFIG.TRACK_HEIGHT;
        this.trackMesh.receiveShadow = true;
        this.scene.add(this.trackMesh);
    }

    createRails() {
        const railGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.5);
        const railMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.RAIL,
            roughness: 0.3,
            metalness: 0.8,
        });

        const leftOffset = GAME_CONFIG.TRACK_WIDTH * 0.3;
        const rightOffset = -GAME_CONFIG.TRACK_WIDTH * 0.3;

        for (let i = 0; i < 200; i++) {
            const t = i / 200;
            const point = this.curve.getPointAt(t);
            const tangent = this.curve.getTangentAt(t).normalize();
            const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

            const leftRail = new THREE.Mesh(railGeometry, railMaterial);
            leftRail.position.copy(point);
            leftRail.position.x += normal.x * leftOffset;
            leftRail.position.z += normal.z * leftOffset;
            leftRail.position.y += 0.1;
            leftRail.lookAt(point.clone().add(tangent));
            this.rails.push(leftRail);
            this.scene.add(leftRail);

            const rightRail = new THREE.Mesh(railGeometry, railMaterial);
            rightRail.position.copy(point);
            rightRail.position.x += normal.x * rightOffset;
            rightRail.position.z += normal.z * rightOffset;
            rightRail.position.y += 0.1;
            rightRail.lookAt(point.clone().add(tangent));
            this.rails.push(rightRail);
            this.scene.add(rightRail);
        }
    }

    createTies() {
        const tieGeometry = new THREE.BoxGeometry(GAME_CONFIG.TRACK_WIDTH * 0.8, 0.1, 0.2);
        const tieMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            roughness: 0.9,
        });

        for (let i = 0; i < 150; i++) {
            const t = i / 150;
            const point = this.curve.getPointAt(t);
            const tangent = this.curve.getTangentAt(t).normalize();

            const tie = new THREE.Mesh(tieGeometry, tieMaterial);
            tie.position.copy(point);
            tie.position.y = 0.05;
            tie.lookAt(point.clone().add(tangent));
            this.ties.push(tie);
            this.scene.add(tie);
        }
    }

    createCave() {
        const caveWallGeometry = new THREE.PlaneGeometry(50, 15);
        const caveWallMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.CAVE_WALL,
            roughness: 0.9,
            side: THREE.DoubleSide,
        });

        for (let i = 0; i < 40; i++) {
            const t = i / 40;
            const point = this.curve.getPointAt(t);
            const tangent = this.curve.getTangentAt(t).normalize();
            const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

            const leftWall = new THREE.Mesh(caveWallGeometry, caveWallMaterial);
            leftWall.position.copy(point);
            leftWall.position.x += normal.x * 12;
            leftWall.position.z += normal.z * 12;
            leftWall.position.y = 7;
            leftWall.lookAt(point.clone().add(new THREE.Vector3(-normal.x * 5, 7, -normal.z * 5)));
            this.caveWalls.push(leftWall);
            this.scene.add(leftWall);

            const rightWall = new THREE.Mesh(caveWallGeometry, caveWallMaterial);
            rightWall.position.copy(point);
            rightWall.position.x -= normal.x * 12;
            rightWall.position.z -= normal.z * 12;
            rightWall.position.y = 7;
            rightWall.lookAt(point.clone().add(new THREE.Vector3(normal.x * 5, 7, normal.z * 5)));
            this.caveWalls.push(rightWall);
            this.scene.add(rightWall);
        }

        const ceilingGeometry = new THREE.PlaneGeometry(25, GAME_CONFIG.TRACK_SEGMENT_LENGTH);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a0f08,
            roughness: 0.9,
            side: THREE.DoubleSide,
        });

        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(0, 12, -GAME_CONFIG.TRACK_SEGMENT_LENGTH / 2);
        this.scene.add(ceiling);

        const floorGeometry = new THREE.PlaneGeometry(30, GAME_CONFIG.TRACK_SEGMENT_LENGTH);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.CAVE_FLOOR,
            roughness: 0.9,
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, -1, -GAME_CONFIG.TRACK_SEGMENT_LENGTH / 2);
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    getPointAt(t) {
        return this.curve.getPointAt(t);
    }

    getTangentAt(t) {
        return this.curve.getTangentAt(t);
    }

    getLength() {
        return this.trackLength;
    }

    getTrackPosition(t, lateralOffset = 0) {
        const point = this.curve.getPointAt(t);
        const tangent = this.curve.getTangentAt(t).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

        return {
            position: new THREE.Vector3(
                point.x + normal.x * lateralOffset,
                point.y,
                point.z + normal.z * lateralOffset
            ),
            tangent: tangent,
            normal: normal,
        };
    }

    dispose() {
        this.scene.remove(this.trackMesh);
        this.trackMesh.geometry.dispose();
        this.trackMesh.material.dispose();

        this.rails.forEach(rail => {
            this.scene.remove(rail);
            rail.geometry.dispose();
            rail.material.dispose();
        });

        this.ties.forEach(tie => {
            this.scene.remove(tie);
            tie.geometry.dispose();
            tie.material.dispose();
        });

        this.caveWalls.forEach(wall => {
            this.scene.remove(wall);
            wall.geometry.dispose();
            wall.material.dispose();
        });
    }
}
