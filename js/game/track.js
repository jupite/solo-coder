import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Track {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.waypoints = [];
        this.group = new THREE.Group();
        this.init();
    }

    init() {
        this.createGround();
        this.createTrack();
        this.createKerbs();
        this.createSigns();
        this.scene.add(this.group);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.COLORS.GROUND,
            roughness: 0.8,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.group.add(ground);
    }

    createTrack() {
        const { RADIUS, WIDTH, SEGMENTS, ROAD_HEIGHT } = CONFIG.TRACK;
        const points = [];

        for (let i = 0; i <= SEGMENTS; i++) {
            const angle = (i / SEGMENTS) * Math.PI * 2;
            const x = Math.cos(angle) * RADIUS;
            const z = Math.sin(angle) * RADIUS;
            points.push(new THREE.Vector3(x, ROAD_HEIGHT / 2, z));
            this.waypoints.push(new THREE.Vector3(x, 0, z));
        }

        const curve = new THREE.CatmullRomCurve3(points, true);
        const tubeGeometry = new THREE.TubeGeometry(curve, SEGMENTS * 4, WIDTH / 2, 8, true);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.COLORS.ROAD,
            roughness: 0.9,
        });

        this.mesh = new THREE.Mesh(tubeGeometry, roadMaterial);
        this.mesh.receiveShadow = true;
        this.group.add(this.mesh);

        const startLine = this.createStartLine();
        this.group.add(startLine);
    }

    createStartLine() {
        const { WIDTH, ROAD_HEIGHT } = CONFIG.TRACK;
        const lineGroup = new THREE.Group();

        const lineGeometry = new THREE.BoxGeometry(WIDTH, 0.05, 0.5);
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(CONFIG.TRACK.RADIUS, ROAD_HEIGHT + 0.03, 0);
        line.rotation.y = Math.PI / 2;
        lineGroup.add(line);

        for (let i = 0; i < 8; i++) {
            const checkerGeometry = new THREE.BoxGeometry(2, 0.05, 2);
            const checkerMaterial = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0x000000 : 0xffffff,
            });
            const checker = new THREE.Mesh(checkerGeometry, checkerMaterial);
            checker.position.set(CONFIG.TRACK.RADIUS, ROAD_HEIGHT + 0.02, (i - 3.5) * 2);
            checker.rotation.y = Math.PI / 2;
            lineGroup.add(checker);
        }

        return lineGroup;
    }

    createKerbs() {
        const { RADIUS, WIDTH, SEGMENTS, KERB_HEIGHT, KERB_WIDTH } = CONFIG.TRACK;
        const innerRadius = RADIUS - WIDTH / 2 - KERB_WIDTH / 2;
        const outerRadius = RADIUS + WIDTH / 2 + KERB_WIDTH / 2;

        for (let side = 0; side < 2; side++) {
            const radius = side === 0 ? innerRadius : outerRadius;
            for (let i = 0; i < SEGMENTS; i++) {
                const angle = (i / SEGMENTS) * Math.PI * 2;
                const nextAngle = ((i + 1) / SEGMENTS) * Math.PI * 2;

                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;
                const x2 = Math.cos(nextAngle) * radius;
                const z2 = Math.sin(nextAngle) * radius;

                const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);

                const kerbGeometry = new THREE.BoxGeometry(KERB_WIDTH, KERB_HEIGHT, length);
                const kerbMaterial = new THREE.MeshStandardMaterial({
                    color: i % 2 === 0 ? CONFIG.COLORS.KERB_RED : CONFIG.COLORS.KERB_WHITE,
                });

                const kerb = new THREE.Mesh(kerbGeometry, kerbMaterial);
                kerb.position.set((x1 + x2) / 2, KERB_HEIGHT / 2, (z1 + z2) / 2);
                kerb.rotation.y = -angle + Math.PI / 2;
                kerb.castShadow = true;
                kerb.receiveShadow = true;
                this.group.add(kerb);
            }
        }
    }

    createSigns() {
        const { RADIUS, WIDTH, SEGMENTS } = CONFIG.TRACK;
        const signPositions = [0, 16, 32, 48];

        signPositions.forEach((index, i) => {
            const angle = (index / SEGMENTS) * Math.PI * 2;
            const radius = RADIUS + WIDTH / 2 + 5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const sign = this.createSignPost(i + 1);
            sign.position.set(x, 0, z);
            sign.rotation.y = -angle;
            this.group.add(sign);
        });
    }

    createSignPost(distance) {
        const group = new THREE.Group();

        const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 3;
        pole.castShadow = true;
        group.add(pole);

        const signGeometry = new THREE.BoxGeometry(3, 2, 0.2);
        const signMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.y = 5;
        sign.castShadow = true;
        group.add(sign);

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${distance}`, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), textMaterial);
        textMesh.position.set(0, 5, 0.11);
        group.add(textMesh);

        return group;
    }

    getWaypoint(index) {
        const i = index % this.waypoints.length;
        if (i < 0) return this.waypoints[this.waypoints.length + i];
        return this.waypoints[i];
    }

    getNearestWaypoint(position) {
        let nearest = 0;
        let minDist = Infinity;

        for (let i = 0; i < this.waypoints.length; i++) {
            const dist = position.distanceTo(this.waypoints[i]);
            if (dist < minDist) {
                minDist = dist;
                nearest = i;
            }
        }

        return nearest;
    }

    getStartPosition() {
        return new THREE.Vector3(CONFIG.TRACK.RADIUS - 10, CONFIG.CAR.HEIGHT / 2, 0);
    }

    getStartRotation() {
        return new THREE.Euler(0, -Math.PI / 2, 0);
    }
}
