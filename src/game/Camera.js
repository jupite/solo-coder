import * as THREE from 'three';

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    this.offset = new THREE.Vector3(0, 8, 20);
    this.lookOffset = new THREE.Vector3(0, 2, 0);
    this.smoothFactor = 3;
    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
  }

  update(target, dt) {
    const { position, rotation } = target;

    const forward = new THREE.Vector3(
      -Math.sin(rotation.y) * Math.cos(rotation.x),
      Math.sin(rotation.x),
      -Math.cos(rotation.y) * Math.cos(rotation.x)
    ).normalize();

    const right = new THREE.Vector3(
      Math.cos(rotation.y),
      0,
      -Math.sin(rotation.y)
    );

    const desiredOffset = new THREE.Vector3()
      .addScaledVector(forward, -this.offset.z)
      .addScaledVector(right, this.offset.x)
      .add(new THREE.Vector3(0, this.offset.y, 0));

    this.targetPosition.copy(position).add(desiredOffset);
    this.targetLookAt.copy(position).add(this.lookOffset);

    const t = Math.min(1, this.smoothFactor * dt);
    this.camera.position.lerp(this.targetPosition, t);

    const currentLookAt = new THREE.Vector3();
    this.camera.getWorldDirection(currentLookAt);
    currentLookAt.add(this.camera.position);

    currentLookAt.lerp(this.targetLookAt, t);
    this.camera.lookAt(currentLookAt);
  }

  reset(target) {
    const { position, rotation } = target;

    const forward = new THREE.Vector3(
      -Math.sin(rotation.y) * Math.cos(rotation.x),
      Math.sin(rotation.x),
      -Math.cos(rotation.y) * Math.cos(rotation.x)
    ).normalize();

    const desiredOffset = new THREE.Vector3()
      .addScaledVector(forward, -this.offset.z)
      .add(new THREE.Vector3(0, this.offset.y, 0));

    this.camera.position.copy(position).add(desiredOffset);
    this.camera.lookAt(position.clone().add(this.lookOffset));
  }
}
