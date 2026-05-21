import * as THREE from 'three';
import { CONSTANTS } from './constants.js';

export class InputManager {
  constructor(camera, slingshot) {
    this.camera = camera;
    this.slingshot = slingshot;
    this.isDragging = false;
    this.dragStartPos = new THREE.Vector3();
    this.currentDragPos = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    const restPos = slingshot.getRestPosition();
    const planeNormal = new THREE.Vector3();
    planeNormal.subVectors(camera.position, restPos).normalize();
    this.plane = new THREE.Plane(planeNormal, -planeNormal.dot(restPos));
    
    this.onMouseDown = null;
    this.onMouseMove = null;
    this.onMouseUp = null;
    
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }

  handleMouseDown(e) {
    if (e.target.tagName === 'BUTTON') return;
    
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const restPos = this.slingshot.getRestPosition();
    const intersectPoint = new THREE.Vector3();
    const intersects = this.raycaster.ray.intersectPlane(this.plane, intersectPoint);
    
    if (!intersects) return;
    
    this.isDragging = true;
    this.dragStartPos.copy(restPos);
    this.currentDragPos.copy(intersectPoint);
    
    if (this.onMouseDown) {
      this.onMouseDown(intersectPoint);
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const intersectPoint = new THREE.Vector3();
    const intersects = this.raycaster.ray.intersectPlane(this.plane, intersectPoint);
    
    if (!intersects) return;
    
    const restPos = this.slingshot.getRestPosition();
    const dragDir = intersectPoint.clone().sub(restPos);
    const toCamera = this.camera.position.clone().sub(restPos).normalize();
    
    const forwardComponent = dragDir.dot(toCamera);
    
    if (forwardComponent < 0) {
      const correction = toCamera.clone().multiplyScalar(-forwardComponent * 1.5);
      intersectPoint.add(correction);
    }
    
    this.currentDragPos.copy(intersectPoint);
    
    if (this.onMouseMove) {
      this.onMouseMove(intersectPoint);
    }
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    if (this.onMouseUp) {
      const velocity = this.calculateVelocity();
      this.onMouseUp(this.currentDragPos, velocity);
    }
  }

  calculateVelocity() {
    const restPos = this.slingshot.getRestPosition();
    const direction = restPos.clone().sub(this.currentDragPos);
    const distance = direction.length();
    
    const clampedDistance = Math.min(distance, CONSTANTS.MAX_DRAG_DISTANCE);
    const speed = clampedDistance * CONSTANTS.FORCE_MULTIPLIER;
    
    return direction.normalize().multiplyScalar(speed);
  }

  getPullDistance() {
    const restPos = this.slingshot.getRestPosition();
    return this.currentDragPos.distanceTo(restPos);
  }

  dispose() {
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }
}
