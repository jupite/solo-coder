import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class BowlingPins {
  constructor(scene, physics, startPosition) {
    this.scene = scene;
    this.physics = physics;
    this.startPosition = startPosition;
    
    this.pins = [];
    this.originalPositions = [];
    this.knockedDownCount = 0;
    
    this.createPins();
  }

  createPins() {
    const pinPositions = this.calculatePinPositions();
    
    pinPositions.forEach((pos, index) => {
      const pin = this.createPin(pos);
      pin.index = index;
      this.pins.push(pin);
      this.originalPositions.push(pos.clone());
    });
  }

  calculatePinPositions() {
    const positions = [];
    const spacing = 0.3;
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col <= row; col++) {
        const x = this.startPosition.x;
        const y = this.startPosition.y;
        const z = this.startPosition.z + (col - row / 2) * spacing;
        
        positions.push(new THREE.Vector3(x, y, z));
      }
    }
    
    return positions;
  }

  createPin(position) {
    const group = new THREE.Group();
    
    const bodyGeometry = new THREE.CylinderGeometry(0.04, 0.055, 0.38, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.4,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.19;
    group.add(body);
    
    const headGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 0.4;
    group.add(head);
    
    const neckGeometry = new THREE.CylinderGeometry(0.025, 0.04, 0.08, 12);
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
    neck.position.y = 0.36;
    group.add(neck);
    
    const bottomGeometry = new THREE.CylinderGeometry(0.06, 0.065, 0.03, 12);
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1
    });
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.position.y = 0.015;
    group.add(bottom);
    
    group.position.copy(position);
    this.scene.add(group);
    
    const physicsBody = this.createPhysicsBody(position);
    physicsBody.userData = { mesh: group, isPin: true };
    
    return { mesh: group, physicsBody };
  }

  createPhysicsBody(position) {
    const shape = new CANNON.Cylinder(0.04, 0.055, 0.42, 8);
    const body = new CANNON.Body({
      mass: 1,
      material: this.physics.materials.pin,
      shape: shape
    });
    body.position.set(position.x, position.y + 0.21, position.z);
    body.linearDamping = 0.02;
    body.angularDamping = 0.05;
    
    this.physics.addBody(body);
    return body;
  }

  update() {
    this.knockedDownCount = 0;
    
    this.pins.forEach(pin => {
      pin.mesh.position.copy(pin.physicsBody.position);
      pin.mesh.quaternion.copy(pin.physicsBody.quaternion);
      
      if (this.isPinKnockedDown(pin)) {
        this.knockedDownCount++;
      }
    });
  }

  isPinKnockedDown(pin) {
    const q = pin.physicsBody.quaternion;
    const up = new CANNON.Vec3(0, 1, 0);
    const pinUp = new CANNON.Vec3(0, 0, 0);
    q.vmult(up, pinUp);
    
    const dot = up.dot(pinUp);
    return Math.abs(dot) < 0.3;
  }

  reset() {
    this.pins.forEach((pin, index) => {
      const originalPos = this.originalPositions[index];
      pin.physicsBody.position.set(originalPos.x, originalPos.y + 0.21, originalPos.z);
      pin.physicsBody.velocity.set(0, 0, 0);
      pin.physicsBody.angularVelocity.set(0, 0, 0);
      pin.physicsBody.quaternion.set(0, 0, 0, 1);
    });
    this.knockedDownCount = 0;
  }

  getKnockedDownCount() {
    return this.knockedDownCount;
  }

  getRemainingPins() {
    return this.pins.length - this.knockedDownCount;
  }

  dispose() {
    this.pins.forEach(pin => {
      this.scene.remove(pin.mesh);
      pin.mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.physics.removeBody(pin.physicsBody);
    });
    this.pins = [];
    this.originalPositions = [];
  }
}
