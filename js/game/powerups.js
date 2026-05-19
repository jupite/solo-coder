class PowerupSystem {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        this.powerups = [];
        this.group = new THREE.Group();
        this.init();
    }

    init() {
        this.createPowerups();
        this.scene.add(this.group);
    }

    createPowerups() {
        const { COUNT, SIZE } = CONFIG.POWERUPS;
        
        for (let i = 0; i < COUNT; i++) {
            const waypointIndex = Math.floor(Math.random() * this.track.waypoints.length);
            const waypoint = this.track.getWaypoint(waypointIndex);
            const nextWaypoint = this.track.getWaypoint(waypointIndex + 1);
            
            const direction = new THREE.Vector3().subVectors(nextWaypoint, waypoint).normalize();
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
            const offset = (Math.random() - 0.5) * (CONFIG.TRACK.WIDTH * 0.6);
            
            const position = waypoint.clone().add(perpendicular.multiplyScalar(offset));
            
            const powerup = {
                mesh: this.createPowerupMesh(SIZE),
                basePosition: position,
                active: true,
                respawnTime: 0,
                size: SIZE,
                time: Math.random() * Math.PI * 2,
            };
            
            powerup.mesh.position.copy(position);
            powerup.mesh.position.y = SIZE + CONFIG.POWERUPS.FLOAT_HEIGHT;
            
            this.powerups.push(powerup);
            this.group.add(powerup.mesh);
        }
    }

    createPowerupMesh(size) {
        const group = new THREE.Group();
        
        const gemGeometry = new THREE.OctahedronGeometry(size / 2, 0);
        const gemMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.COLORS.POWERUP,
            emissive: CONFIG.COLORS.POWERUP,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.8,
        });
        
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        gem.castShadow = true;
        group.add(gem);
        
        const glowGeometry = new THREE.SphereGeometry(size * 0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.POWERUP,
            transparent: true,
            opacity: 0.2,
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
        
        return group;
    }

    update(deltaTime) {
        const { ROTATION_SPEED, FLOAT_SPEED, FLOAT_HEIGHT, RESPAWN_TIME } = CONFIG.POWERUPS;
        
        this.powerups.forEach(powerup => {
            if (!powerup.active) {
                if (performance.now() > powerup.respawnTime) {
                    powerup.active = true;
                    powerup.mesh.visible = true;
                }
                return;
            }
            
            powerup.time += deltaTime;
            
            powerup.mesh.rotation.y += deltaTime * ROTATION_SPEED;
            powerup.mesh.position.y = powerup.basePosition.y + powerup.size + 
                Math.sin(powerup.time * FLOAT_SPEED) * FLOAT_HEIGHT;
            
            const glow = powerup.mesh.children[1];
            if (glow) {
                glow.material.opacity = 0.15 + Math.sin(powerup.time * 3) * 0.1;
            }
        });
    }

    getPowerups() {
        return this.powerups;
    }

    checkCollision(position, radius) {
        for (const powerup of this.powerups) {
            if (!powerup.active) continue;
            
            const distance = position.distanceTo(powerup.mesh.position);
            if (distance < radius + powerup.size / 2) {
                this.collectPowerup(powerup);
                return true;
            }
        }
        return false;
    }

    collectPowerup(powerup) {
        powerup.active = false;
        powerup.mesh.visible = false;
        powerup.respawnTime = performance.now() + CONFIG.POWERUPS.RESPAWN_TIME;
    }

    reset() {
        this.powerups.forEach(powerup => {
            powerup.active = true;
            powerup.mesh.visible = true;
            powerup.mesh.position.copy(powerup.basePosition);
            powerup.mesh.position.y = powerup.size + CONFIG.POWERUPS.FLOAT_HEIGHT;
            powerup.time = Math.random() * Math.PI * 2;
        });
    }
}
