import * as THREE from 'three';

export class InputController {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
        this.isDragging = false;
        this.isAiming = false;
        this.dragStart = new THREE.Vector2();
        this.dragEnd = new THREE.Vector2();
        this.currentDrag = new THREE.Vector2();
        
        this.onAimStartCallback = null;
        this.onAimUpdateCallback = null;
        this.onAimEndCallback = null;
        
        this.minPower = 5;
        this.maxPower = 30;
        this.maxDragDistance = 200;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
        
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    
    onMouseDown(event) {
        if (event.button !== 0) return;
        
        event.preventDefault();
        this.startAim(event.clientX, event.clientY);
    }
    
    onMouseMove(event) {
        if (!this.isAiming) return;
        
        event.preventDefault();
        this.updateAim(event.clientX, event.clientY);
    }
    
    onMouseUp(event) {
        if (!this.isAiming) return;
        
        event.preventDefault();
        this.endAim();
    }
    
    onTouchStart(event) {
        if (event.touches.length !== 1) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        this.startAim(touch.clientX, touch.clientY);
    }
    
    onTouchMove(event) {
        if (!this.isAiming || event.touches.length !== 1) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        this.updateAim(touch.clientX, touch.clientY);
    }
    
    onTouchEnd(event) {
        if (!this.isAiming) return;
        
        event.preventDefault();
        this.endAim();
    }
    
    startAim(clientX, clientY) {
        this.isAiming = true;
        this.dragStart.set(clientX, clientY);
        this.currentDrag.set(0, 0);
        
        if (this.onAimStartCallback) {
            this.onAimStartCallback();
        }
    }
    
    updateAim(clientX, clientY) {
        this.dragEnd.set(clientX, clientY);
        this.currentDrag.subVectors(this.dragStart, this.dragEnd);
        
        const power = this.calculatePower();
        const direction = this.calculateDirection();
        
        if (this.onAimUpdateCallback) {
            this.onAimUpdateCallback(power, direction, this.currentDrag);
        }
    }
    
    endAim() {
        if (!this.isAiming) return;
        
        this.isAiming = false;
        const power = this.calculatePower();
        const direction = this.calculateDirection();
        
        if (this.onAimEndCallback && power > this.minPower) {
            this.onAimEndCallback(power, direction);
        }
        
        this.currentDrag.set(0, 0);
    }
    
    calculatePower() {
        const distance = this.currentDrag.length();
        const normalizedDistance = Math.min(distance / this.maxDragDistance, 1);
        return this.minPower + normalizedDistance * (this.maxPower - this.minPower);
    }
    
    calculateDirection() {
        if (this.currentDrag.length() === 0) {
            return new THREE.Vector3(0, 0.5, -1).normalize();
        }
        
        const normalizedDrag = this.currentDrag.clone().normalize();
        
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        
        const horizontalAngle = normalizedDrag.x * 0.8;
        const verticalAngle = 0.3 + normalizedDrag.y * 0.6;
        
        const direction = new THREE.Vector3();
        direction.copy(cameraDirection);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), -horizontalAngle);
        direction.y = verticalAngle;
        direction.normalize();
        
        return direction;
    }
    
    getNormalizedPower() {
        const power = this.calculatePower();
        return (power - this.minPower) / (this.maxPower - this.minPower);
    }
    
    setOnAimStartCallback(callback) {
        this.onAimStartCallback = callback;
    }
    
    setOnAimUpdateCallback(callback) {
        this.onAimUpdateCallback = callback;
    }
    
    setOnAimEndCallback(callback) {
        this.onAimEndCallback = callback;
    }
    
    cancelAim() {
        this.isAiming = false;
        this.currentDrag.set(0, 0);
    }
}
