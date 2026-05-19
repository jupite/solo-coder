import * as THREE from 'three';

export class CameraController {
    constructor(camera, canvas, targetPosition = new THREE.Vector3(0, 5, 0)) {
        this.camera = camera;
        this.canvas = canvas;
        this.target = targetPosition.clone();
        
        this.isRightDragging = false;
        this.lastMousePosition = new THREE.Vector2();
        
        this.theta = Math.PI / 2;
        this.phi = Math.PI / 4;
        this.radius = 30;
        
        this.minPhi = 0.1;
        this.maxPhi = Math.PI / 2 - 0.1;
        this.minRadius = 10;
        this.maxRadius = 60;
        
        this.rotationSpeed = 0.005;
        this.zoomSpeed = 0.001;
        
        this.updateCameraPosition();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
        
        this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    }
    
    onMouseDown(event) {
        if (event.button !== 2) return;
        
        event.preventDefault();
        this.isRightDragging = true;
        this.lastMousePosition.set(event.clientX, event.clientY);
    }
    
    onMouseMove(event) {
        if (!this.isRightDragging) return;
        
        event.preventDefault();
        
        const deltaX = event.clientX - this.lastMousePosition.x;
        const deltaY = event.clientY - this.lastMousePosition.y;
        
        this.theta -= deltaX * this.rotationSpeed;
        this.phi -= deltaY * this.rotationSpeed;
        
        this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi));
        
        this.lastMousePosition.set(event.clientX, event.clientY);
        this.updateCameraPosition();
    }
    
    onMouseUp(event) {
        if (event.button !== 2) return;
        
        this.isRightDragging = false;
    }
    
    onWheel(event) {
        event.preventDefault();
        
        const delta = event.deltaY * this.zoomSpeed;
        this.radius += delta;
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius));
        
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        const x = this.target.x + this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.target.y + this.radius * Math.cos(this.phi);
        const z = this.target.z + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(this.target);
    }
    
    setTarget(position) {
        this.target.copy(position);
        this.updateCameraPosition();
    }
    
    update(deltaTime) {
    }
}
