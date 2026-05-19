class ObstacleSystem {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.obstacles = [];
        this.group = new THREE.Group();
        this.init();
    }

    init() {
        this.createObstacles();
        this.scene.add(this.group);
    }

    createObstacles() {
        const { COUNT, SIZE, SPEED_MIN, SPEED_MAX, MOVE_RADIUS } = CONFIG.OBSTACLES;
        
        for (let i = 0; i < COUNT; i++) {
            const waypointIndex = Math.floor(Math.random() * this.track.waypoints.length);
            const waypoint = this.track.getWaypoint(waypointIndex);
            const nextWaypoint = this.track.getWaypoint(waypointIndex + 1);
            
            const direction = new THREE.Vector3().subVectors(nextWaypoint, waypoint).normalize();
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
            const offset = (Math.random() - 0.5) * (CONFIG.TRACK.WIDTH * 0.6);
            
            const basePosition = waypoint.clone().add(perpendicular.multiplyScalar(offset));
            
            const obstacle = {
                mesh: this.createObstacleMesh(SIZE),
                basePosition: basePosition,
                moveDirection: new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize(),
                speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
                moveRadius: MOVE_RADIUS * (0.5 + Math.random() * 0.5),
                time: Math.random() * Math.PI * 2,
                size: SIZE,
            };
            
            obstacle.mesh.position.copy(basePosition);
            obstacle.mesh.position.y = SIZE / 2;
            
            this.obstacles.push(obstacle);
            this.group.add(obstacle.mesh);
        }
    }

    createObstacleMesh(size) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color: CONFIG.COLORS.OBSTACLE,
            roughness: 0.7,
            metalness: 0.3,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edges);
        
        return mesh;
    }

    update(deltaTime) {
        this.obstacles.forEach(obstacle => {
            obstacle.time += deltaTime * obstacle.speed * 0.5;
            
            const offsetX = Math.sin(obstacle.time) * obstacle.moveRadius;
            const offsetZ = Math.cos(obstacle.time * 0.7) * obstacle.moveRadius * 0.5;
            
            obstacle.mesh.position.x = obstacle.basePosition.x + offsetX;
            obstacle.mesh.position.z = obstacle.basePosition.z + offsetZ;
            obstacle.mesh.position.y = obstacle.size / 2 + Math.sin(obstacle.time * 2) * 0.2;
            
            obstacle.mesh.rotation.x += deltaTime * 0.5;
            obstacle.mesh.rotation.y += deltaTime * 0.3;
        });
    }

    getObstacles() {
        return this.obstacles;
    }

    checkCollision(position, radius) {
        for (const obstacle of this.obstacles) {
            const distance = position.distanceTo(obstacle.mesh.position);
            if (distance < radius + obstacle.size / 2) {
                return { hit: true, obstacle, distance };
            }
        }
        return { hit: false };
    }

    reset() {
        this.obstacles.forEach(obstacle => {
            obstacle.mesh.position.copy(obstacle.basePosition);
            obstacle.mesh.position.y = obstacle.size / 2;
            obstacle.time = Math.random() * Math.PI * 2;
        });
    }
}
