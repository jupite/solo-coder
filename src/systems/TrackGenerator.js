import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants.js';
import { randomRange, randomChoice } from '../utils/helpers.js';
import { Tree } from '../entities/Tree.js';
import { Flag } from '../entities/Flag.js';

export class TrackGenerator {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.trackSegments = [];
        this.trees = [];
        this.flags = [];
        this.treePool = [];
        this.flagPool = [];
        
        this.segmentLength = GAME_CONFIG.TRACK_SEGMENT_LENGTH;
        this.segmentsVisible = GAME_CONFIG.TRACK_SEGMENTS_VISIBLE;
        this.trackWidth = GAME_CONFIG.TRACK_WIDTH;
        
        this.init();
    }
    
    init() {
        this.createSnowMaterial();
        
        for (let i = 0; i < this.segmentsVisible; i++) {
            this.createTrackSegment(-i * this.segmentLength);
        }
    }
    
    createSnowMaterial() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 256);
        
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 2 + 1;
            ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.snowTexture = new THREE.CanvasTexture(canvas);
        this.snowTexture.wrapS = THREE.RepeatWrapping;
        this.snowTexture.wrapT = THREE.RepeatWrapping;
        this.snowTexture.repeat.set(4, 20);
        
        this.snowMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.SNOW,
            map: this.snowTexture,
            roughness: 0.8,
            metalness: 0.1,
        });
    }
    
    createTrackSegment(zPosition) {
        const segment = new THREE.Group();
        
        const overlap = 4;
        const groundGeometry = new THREE.PlaneGeometry(
            this.trackWidth + 40,
            this.segmentLength + overlap,
            30,
            30
        );
        
        const positions = groundGeometry.attributes.position;
        const halfLength = (this.segmentLength + overlap) / 2;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            
            const edgeFactor = Math.abs(y) / halfLength;
            const smoothFactor = Math.max(0, 1 - Math.pow(edgeFactor, 3));
            
            const noise = Math.sin(x * 0.3 + zPosition * 0.01) * Math.cos(y * 0.2) * 0.15 * smoothFactor;
            positions.setZ(i, noise);
        }
        groundGeometry.computeVertexNormals();
        
        const ground = new THREE.Mesh(groundGeometry, this.snowMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.z = zPosition;
        ground.receiveShadow = true;
        segment.add(ground);
        
        this.populateSegment(segment, zPosition);
        
        this.sceneManager.add(segment);
        this.trackSegments.push({
            mesh: segment,
            z: zPosition,
        });
    }
    
    populateSegment(segment, zPosition) {
        const treesPerSide = Math.floor(randomRange(2, 5));
        
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < treesPerSide; i++) {
                if (Math.random() > GAME_CONFIG.TREE_SPAWN_CHANCE) continue;
                
                const x = side * (GAME_CONFIG.TRACK_WIDTH / 2 + randomRange(2, 15));
                const z = zPosition + randomRange(-this.segmentLength / 2, this.segmentLength / 2);
                
                const tree = this.getTreeFromPool();
                tree.setPosition(x, z);
                segment.add(tree.mesh);
                this.trees.push(tree);
            }
        }
        
        const flagCount = Math.floor(randomRange(1, 3));
        for (let i = 0; i < flagCount; i++) {
            if (Math.random() > GAME_CONFIG.FLAG_SPAWN_CHANCE) continue;
            
            const x = randomRange(-this.trackWidth / 3, this.trackWidth / 3);
            const z = zPosition + randomRange(-this.segmentLength / 2, this.segmentLength / 2);
            
            const flag = this.getFlagFromPool();
            flag.setPosition(x, z);
            segment.add(flag.mesh);
            this.flags.push(flag);
        }
    }
    
    getTreeFromPool() {
        if (this.treePool.length > 0) {
            return this.treePool.pop();
        }
        return new Tree();
    }
    
    getFlagFromPool() {
        if (this.flagPool.length > 0) {
            return this.flagPool.pop();
        }
        return new Flag();
    }
    
    recycleTree(tree) {
        if (tree.mesh.parent) {
            tree.mesh.parent.remove(tree.mesh);
        }
        this.treePool.push(tree);
    }
    
    recycleFlag(flag) {
        if (flag.mesh.parent) {
            flag.mesh.parent.remove(flag.mesh);
        }
        this.flagPool.push(flag);
    }
    
    update(playerZ, deltaTime) {
        const recycleThreshold = playerZ + this.segmentLength;
        const createThreshold = playerZ - this.segmentsVisible * this.segmentLength;
        
        this.trackSegments = this.trackSegments.filter((segment) => {
            if (segment.z > recycleThreshold) {
                this.sceneManager.remove(segment.mesh);
                return false;
            }
            return true;
        });
        
        this.trees = this.trees.filter((tree) => {
            if (tree.getPosition().z > recycleThreshold) {
                this.recycleTree(tree);
                return false;
            }
            return true;
        });
        
        this.flags = this.flags.filter((flag) => {
            if (flag.isCollected() || flag.getPosition().z > recycleThreshold) {
                this.recycleFlag(flag);
                return false;
            }
            return true;
        });
        
        const lastSegment = this.trackSegments[this.trackSegments.length - 1];
        if (lastSegment && lastSegment.z > createThreshold) {
            const newZ = lastSegment.z - this.segmentLength;
            this.createTrackSegment(newZ);
        }
        
        this.flags.forEach((flag) => flag.update(deltaTime));
    }
    
    getTrees() {
        return this.trees;
    }
    
    getFlags() {
        return this.flags;
    }
    
    getTrackWidth() {
        return this.trackWidth;
    }
    
    reset() {
        this.trackSegments.forEach((segment) => {
            this.sceneManager.remove(segment.mesh);
        });
        this.trackSegments = [];
        
        this.trees.forEach((tree) => this.recycleTree(tree));
        this.trees = [];
        
        this.flags.forEach((flag) => this.recycleFlag(flag));
        this.flags = [];
        
        this.init();
    }
}
