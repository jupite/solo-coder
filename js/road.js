import * as THREE from 'three';

export class RoadGenerator {
    constructor(scene) {
        this.scene = scene;
        this.roadPoints = [];
        this.roadWidth = 8;
        this.goalArea = null;
        
        this.generateRoad();
        this.createGoalArea();
    }
    
    generateRoad() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.5, 0),
            new THREE.Vector3(5, 0.5, 20),
            new THREE.Vector3(15, 0.8, 40),
            new THREE.Vector3(25, 1.2, 60),
            new THREE.Vector3(30, 1.5, 80),
            new THREE.Vector3(25, 1.2, 100),
            new THREE.Vector3(10, 0.8, 120),
            new THREE.Vector3(-10, 1.0, 140),
            new THREE.Vector3(-30, 1.2, 155),
            new THREE.Vector3(-40, 1.5, 175),
            new THREE.Vector3(-35, 1.8, 200),
            new THREE.Vector3(-20, 2.0, 220),
            new THREE.Vector3(0, 2.2, 240),
            new THREE.Vector3(20, 2.0, 260),
            new THREE.Vector3(35, 1.8, 280),
            new THREE.Vector3(30, 1.5, 300),
            new THREE.Vector3(10, 1.2, 320),
            new THREE.Vector3(-15, 1.0, 340),
            new THREE.Vector3(-25, 0.8, 360)
        ]);
        
        this.roadCurve = curve;
        
        const segments = 200;
        this.roadPoints = curve.getPoints(segments);
        
        this.createRoadMesh(curve);
        this.createRoadBorders(curve);
    }
    
    createRoadMesh(curve) {
        const roadGeometry = new THREE.TubeGeometry(
            curve,
            200,
            this.roadWidth / 2,
            8,
            false
        );
        
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.receiveShadow = true;
        this.scene.add(road);
        this.roadMesh = road;
    }
    
    createRoadBorders(curve) {
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.8
        });
        
        const borderGeometry = new THREE.BoxGeometry(0.3, 0.5, 2);
        const segments = 100;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = curve.getPointAt(t);
            const tangent = curve.getTangentAt(t);
            
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
            leftBorder.position.copy(point);
            leftBorder.position.add(normal.clone().multiplyScalar(this.roadWidth / 2));
            leftBorder.position.y += 0.25;
            this.scene.add(leftBorder);
            
            const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
            rightBorder.position.copy(point);
            rightBorder.position.add(normal.clone().multiplyScalar(-this.roadWidth / 2));
            rightBorder.position.y += 0.25;
            this.scene.add(rightBorder);
        }
    }
    
    createGoalArea() {
        const endPoint = this.roadPoints[this.roadPoints.length - 1];
        
        const goalGeometry = new THREE.CylinderGeometry(5, 5, 0.1, 32);
        const goalMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        
        this.goalArea = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goalArea.position.copy(endPoint);
        this.goalArea.position.y += 0.1;
        this.scene.add(this.goalArea);
        
        const flagGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const flagMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.copy(endPoint);
        flag.position.y += 3;
        flag.castShadow = true;
        this.scene.add(flag);
    }
    
    getStartPosition() {
        return this.roadPoints[0].clone();
    }
    
    getStartDirection() {
        if (this.roadPoints.length < 2) return new THREE.Vector3(0, 0, 1);
        
        const start = this.roadPoints[0];
        const next = this.roadPoints[1];
        return next.clone().sub(start).normalize();
    }
    
    getPointOnRoad(t) {
        return this.roadCurve.getPointAt(t);
    }
    
    getTangentOnRoad(t) {
        return this.roadCurve.getTangentAt(t);
    }
    
    getClosestPointOnRoad(position) {
        let closestT = 0;
        let closestDistance = Infinity;
        
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = this.roadCurve.getPointAt(t);
            const distance = position.distanceTo(point);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestT = t;
            }
        }
        
        return {
            point: this.roadCurve.getPointAt(closestT),
            tangent: this.roadCurve.getTangentAt(closestT),
            t: closestT,
            distance: closestDistance
        };
    }
    
    getRoadHeight(x, z) {
        const position = new THREE.Vector3(x, 0, z);
        const closest = this.getClosestPointOnRoad(position);
        return closest.point.y;
    }
    
    isOnRoad(position) {
        const closest = this.getClosestPointOnRoad(position);
        return closest.distance < this.roadWidth / 2 + 1;
    }
    
    isAtGoal(position) {
        if (!this.goalArea) return false;
        return position.distanceTo(this.goalArea.position) < 6;
    }
    
    getRoadLength() {
        return this.roadCurve.getLength();
    }
}
