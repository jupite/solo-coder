class Track {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.waypoints = [];
        this.group = new THREE.Group();
        this.trackSegments = [];
        this.init();
    }

    init() {
        this.createGround();
        this.createSmoothTrackPoints();
        this.createTrack();
        this.createKerbs();
        this.createSigns();
        this.scene.add(this.group);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(800, 800);
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

    createSmoothTrackPoints() {
        const { SEGMENTS_PER_POINT } = CONFIG.TRACK;
        const points3d = [];
        
        for (let i = 0; i < TRACK_POINTS.length; i++) {
            const p = TRACK_POINTS[i];
            points3d.push(new THREE.Vector3(p.x, 0, p.z));
        }
        
        const curve = new THREE.CatmullRomCurve3(points3d, true, 'centripetal', 0.5);
        const totalPoints = TRACK_POINTS.length * SEGMENTS_PER_POINT;
        
        for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const point = curve.getPoint(t);
            this.waypoints.push(point);
        }
    }

    createTrack() {
        const { WIDTH, ROAD_HEIGHT } = CONFIG.TRACK;
        const trackGroup = new THREE.Group();
        
        for (let i = 0; i < this.waypoints.length; i++) {
            const p1 = this.waypoints[i];
            const p2 = this.waypoints[(i + 1) % this.waypoints.length];
            
            const direction = new THREE.Vector3().subVectors(p2, p1);
            const length = direction.length();
            const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            
            const perp = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
            
            const segmentGeometry = new THREE.BoxGeometry(WIDTH, ROAD_HEIGHT, length);
            const segmentMaterial = new THREE.MeshStandardMaterial({
                color: CONFIG.COLORS.ROAD,
                roughness: 0.9,
            });
            
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.copy(center);
            segment.position.y = ROAD_HEIGHT / 2;
            segment.rotation.y = Math.atan2(direction.x, direction.z);
            segment.receiveShadow = true;
            
            trackGroup.add(segment);
            this.trackSegments.push({ segment, center, perp, direction: direction.clone().normalize(), length });
        }
        
        this.mesh = trackGroup;
        this.group.add(trackGroup);
        
        const startLine = this.createStartLine();
        this.group.add(startLine);
    }

    createStartLine() {
        const { WIDTH, ROAD_HEIGHT } = CONFIG.TRACK;
        const lineGroup = new THREE.Group();

        const startPoint = this.waypoints[0];
        const nextPoint = this.waypoints[10];
        const direction = new THREE.Vector3().subVectors(nextPoint, startPoint).normalize();

        const lineGeometry = new THREE.BoxGeometry(WIDTH, 0.05, 0.5);
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(startPoint.x, ROAD_HEIGHT + 0.03, startPoint.z);
        line.rotation.y = Math.atan2(direction.x, direction.z);
        lineGroup.add(line);

        for (let i = 0; i < 16; i++) {
            const checkerGeometry = new THREE.BoxGeometry(2, 0.05, 2);
            const checkerMaterial = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0x000000 : 0xffffff,
            });
            const checker = new THREE.Mesh(checkerGeometry, checkerMaterial);
            
            const perp = new THREE.Vector3(-direction.z, 0, direction.x);
            const offset = perp.clone().multiplyScalar((i - 7.5) * 2);
            
            checker.position.set(
                startPoint.x + offset.x,
                ROAD_HEIGHT + 0.02,
                startPoint.z + offset.z
            );
            checker.rotation.y = Math.atan2(direction.x, direction.z);
            lineGroup.add(checker);
        }

        return lineGroup;
    }

    createKerbs() {
        const { WIDTH, KERB_HEIGHT, KERB_WIDTH } = CONFIG.TRACK;
        
        for (let i = 0; i < this.trackSegments.length; i++) {
            const seg = this.trackSegments[i];
            const perp = seg.perp;
            
            for (let side = 0; side < 2; side++) {
                const sideOffset = side === 0 ? -1 : 1;
                const kerbPos = seg.center.clone().add(
                    perp.clone().multiplyScalar(sideOffset * (WIDTH / 2 + KERB_WIDTH / 2))
                );
                
                const kerbGeometry = new THREE.BoxGeometry(KERB_WIDTH, KERB_HEIGHT, seg.length);
                const kerbMaterial = new THREE.MeshStandardMaterial({
                    color: i % 2 === 0 ? CONFIG.COLORS.KERB_RED : CONFIG.COLORS.KERB_WHITE,
                });

                const kerb = new THREE.Mesh(kerbGeometry, kerbMaterial);
                kerb.position.copy(kerbPos);
                kerb.position.y = KERB_HEIGHT / 2;
                kerb.rotation.y = Math.atan2(seg.direction.x, seg.direction.z);
                kerb.castShadow = true;
                kerb.receiveShadow = true;
                this.group.add(kerb);
            }
        }
    }

    createSigns() {
        const signInterval = Math.floor(this.waypoints.length / 4);
        
        for (let i = 0; i < 4; i++) {
            const index = i * signInterval;
            const waypoint = this.waypoints[index];
            const nextWaypoint = this.waypoints[(index + 10) % this.waypoints.length];
            
            const direction = new THREE.Vector3().subVectors(nextWaypoint, waypoint).normalize();
            const perp = new THREE.Vector3(-direction.z, 0, direction.x);
            
            const signPos = waypoint.clone().add(perp.clone().multiplyScalar(CONFIG.TRACK.WIDTH / 2 + 5));
            
            const sign = this.createSignPost(i + 1);
            sign.position.set(signPos.x, 0, signPos.z);
            sign.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI;
            this.group.add(sign);
        }
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
        const start = this.waypoints[0];
        const next = this.waypoints[10];
        const direction = new THREE.Vector3().subVectors(next, start).normalize();
        const perp = new THREE.Vector3(-direction.z, 0, direction.x);
        
        return new THREE.Vector3(
            start.x + perp.x * 5 - direction.x * 10,
            CONFIG.CAR.HEIGHT / 2 + CONFIG.TRACK.ROAD_HEIGHT,
            start.z + perp.z * 5 - direction.z * 10
        );
    }

    getStartRotation() {
        const start = this.waypoints[0];
        const next = this.waypoints[10];
        const direction = new THREE.Vector3().subVectors(next, start).normalize();
        const angle = Math.atan2(direction.x, direction.z);
        return new THREE.Euler(0, angle, 0);
    }
}
