import * as THREE from 'three';

export class FollowCamera {
  constructor(scene, container, target) {
    this.scene = scene;
    this.container = container;
    this.target = target;
    
    this.camera = this.createCamera();
    this.controls = {
      offset: new THREE.Vector3(-5, 3, 0),
      targetOffset: new THREE.Vector3(0, 0.5, 0),
      smoothness: 0.05,
      zoom: 1
    };
    
    this.setupResize();
  }

  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(-5, 3, 0);
    camera.lookAt(0, 0, 0);
    
    return camera;
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  update() {
    if (!this.target) return;
    
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(this.target.getPosition());
    targetPosition.add(this.controls.targetOffset);
    
    const desiredPosition = new THREE.Vector3();
    desiredPosition.copy(targetPosition);
    desiredPosition.add(this.controls.offset);
    desiredPosition.multiplyScalar(this.controls.zoom);
    
    this.camera.position.lerp(desiredPosition, this.controls.smoothness);
    this.camera.lookAt(targetPosition);
  }

  setTarget(target) {
    this.target = target;
  }

  setOffset(offset) {
    this.controls.offset.copy(offset);
  }

  setZoom(zoom) {
    this.controls.zoom = Math.max(0.5, Math.min(2, zoom));
  }

  getCamera() {
    return this.camera;
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
  }
}
