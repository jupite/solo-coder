import * as THREE from 'three';
import { PHYSICS } from '../utils/constants.js';

export class InputController {
  constructor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.tiltX = 0;
    this.tiltY = 0;
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.smoothing = 0.08;
    
    this.isLocked = false;
    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      this.mouseX = (e.clientX - centerX) / centerX;
      this.mouseY = (e.clientY - centerY) / centerY;
      
      this.targetTiltY = -this.mouseX * PHYSICS.maxTilt;
      this.targetTiltX = -this.mouseY * PHYSICS.maxTilt;
      
      this.targetTiltX = Math.max(-PHYSICS.maxTilt, Math.min(PHYSICS.maxTilt, this.targetTiltX));
      this.targetTiltY = Math.max(-PHYSICS.maxTilt, Math.min(PHYSICS.maxTilt, this.targetTiltY));
    });
  }

  update() {
    this.tiltX += (this.targetTiltX - this.tiltX) * this.smoothing;
    this.tiltY += (this.targetTiltY - this.tiltY) * this.smoothing;
    
    if (Math.abs(this.tiltX) < 0.01) this.tiltX = 0;
    if (Math.abs(this.tiltY) < 0.01) this.tiltY = 0;
  }

  reset() {
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.tiltX = 0;
    this.tiltY = 0;
  }

  getTiltRadians() {
    return {
      x: THREE.MathUtils.degToRad(this.tiltX),
      y: THREE.MathUtils.degToRad(this.tiltY),
    };
  }

  getTiltDegrees() {
    return {
      x: this.tiltX,
      y: this.tiltY,
    };
  }
}
