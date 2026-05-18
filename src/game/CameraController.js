import * as THREE from 'three';

export class CameraController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.target = new THREE.Vector3(0, 0, 0);
    this.distance = 25;
    this.minDistance = 15;
    this.maxDistance = 40;

    this.theta = Math.PI / 4;
    this.phi = Math.PI / 4;
    this.minPhi = 0.1;
    this.maxPhi = Math.PI / 2.1;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.rotationSpeed = 0.005;
    this.zoomSpeed = 0.001;

    this.setupEventListeners();
    this.updateCameraPosition();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onMouseDown(event) {
    if (event.button === 0 || event.button === 2) {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  onMouseMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.theta -= deltaX * this.rotationSpeed;
    this.phi += deltaY * this.rotationSpeed;

    this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi));

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    this.updateCameraPosition();
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onWheel(event) {
    event.preventDefault();
    this.distance += event.deltaY * this.zoomSpeed;
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    this.updateCameraPosition();
  }

  updateCameraPosition() {
    const x = this.target.x + this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.distance * Math.cos(this.phi);
    const z = this.target.z + this.distance * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  getScreenMovementDirection(input) {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    right.normalize();

    const movement = new THREE.Vector3();

    if (input.forward) movement.add(forward);
    if (input.backward) movement.sub(forward);
    if (input.right) movement.add(right);
    if (input.left) movement.sub(right);

    if (movement.length() > 0) {
      movement.normalize();
    }

    return {
      x: movement.x,
      z: movement.z
    };
  }

  setTarget(x, y, z) {
    this.target.set(x, y, z);
    this.updateCameraPosition();
  }

  reset() {
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 4;
    this.distance = 25;
    this.target.set(0, 0, 0);
    this.updateCameraPosition();
  }
}
