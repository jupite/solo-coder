import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class BowlingBall {
  constructor(scene, physics, position) {
    this.scene = scene;
    this.physics = physics;
    
    this.radius = 0.108;
    this.mass = 7;
    
    this.mesh = this.createMesh();
    this.physicsBody = this.createPhysicsBody(position);
    
    this.isLaunched = false;
    this.trail = null;
    this.trailVisible = false;
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.3,
      metalness: 0.8
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    return mesh;
  }

  createPhysicsBody(position) {
    const body = this.physics.createSphere(
      new CANNON.Vec3(position.x, position.y, position.z),
      this.radius,
      this.mass
    );
    body.sleepSpeedLimit = 0.1;
    body.sleepTimeLimit = 1;
    return body;
  }

  update() {
    if (this.physicsBody) {
      this.mesh.position.copy(this.physicsBody.position);
      this.mesh.quaternion.copy(this.physicsBody.quaternion);
    }
  }

  launch(force) {
    if (this.isLaunched || !this.physicsBody) return;
    
    this.physicsBody.applyImpulse(force, this.physicsBody.position);
    this.isLaunched = true;
    this.hideTrail();
  }

  reset(position) {
    if (!this.physicsBody) return;
    
    this.physicsBody.position.set(position.x, position.y, position.z);
    this.physicsBody.velocity.set(0, 0, 0);
    this.physicsBody.angularVelocity.set(0, 0, 0);
    this.physicsBody.quaternion.set(0, 0, 0, 1);
    this.isLaunched = false;
  }

  showTrail(start, end) {
    if (!this.trail) {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineBasicMaterial({ 
        color: 0xff0000, 
        linewidth: 2,
        transparent: true,
        opacity: 0.7
      });
      this.trail = new THREE.Line(geometry, material);
      this.scene.add(this.trail);
    } else {
      this.trail.geometry.setFromPoints([start, end]);
      this.trail.geometry.verticesNeedUpdate = true;
    }
    this.trail.visible = true;
    this.trailVisible = true;
  }

  hideTrail() {
    if (this.trail) {
      this.trail.visible = false;
    }
    this.trailVisible = false;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    
    if (this.trail) {
      this.scene.remove(this.trail);
      this.trail.geometry.dispose();
      this.trail.material.dispose();
    }
    
    if (this.physicsBody) {
      this.physics.removeBody(this.physicsBody);
    }
  }

  getPosition() {
    return this.physicsBody ? this.physicsBody.position : new CANNON.Vec3(0, 0, 0);
  }

  getVelocity() {
    return this.physicsBody ? this.physicsBody.velocity.length() : 0;
  }
}
