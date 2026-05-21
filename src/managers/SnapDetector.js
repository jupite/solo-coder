import * as THREE from 'three';

class SnapDetector {
  constructor(sceneManager, pieceManager, options = {}) {
    this.sceneManager = sceneManager;
    this.pieceManager = pieceManager;
    
    this.positionThreshold = options.positionThreshold || 0.8;
    this.rotationThreshold = options.rotationThreshold || 0.5;
    this.snapPrecision = options.snapPrecision || 0.2;
    
    this.snapAnimations = new Map();
  }

  checkProximity(piece) {
    const targetPos = piece.userData.targetPosition;
    const targetRot = piece.userData.targetRotation;
    
    const positionDistance = piece.position.distanceTo(targetPos);
    
    const currentQuat = new THREE.Quaternion().setFromEuler(piece.rotation);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
    const rotationDistance = 2 * Math.acos(Math.min(1, Math.abs(currentQuat.dot(targetQuat))));
    
    return positionDistance < this.positionThreshold && rotationDistance < this.rotationThreshold;
  }

  checkSnapCondition(piece) {
    const targetPos = piece.userData.targetPosition;
    const targetRot = piece.userData.targetRotation;
    
    const positionDistance = piece.position.distanceTo(targetPos);
    
    const currentQuat = new THREE.Quaternion().setFromEuler(piece.rotation);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
    const rotationDistance = 2 * Math.acos(Math.min(1, Math.abs(currentQuat.dot(targetQuat))));
    
    return positionDistance < this.snapPrecision && rotationDistance < this.snapPrecision;
  }

  trySnap(piece) {
    if (this.checkProximity(piece)) {
      this.animateSnap(piece);
      return true;
    }
    return false;
  }

  animateSnap(piece) {
    const startPos = piece.position.clone();
    const targetPos = piece.userData.targetPosition.clone();
    
    const startQuat = new THREE.Quaternion().setFromEuler(piece.rotation);
    const targetQuat = new THREE.Quaternion().setFromEuler(piece.userData.targetRotation);
    
    const duration = 300;
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOutCubic(progress);
      
      piece.position.lerpVectors(startPos, targetPos, eased);
      
      const currentQuat = new THREE.Quaternion();
      currentQuat.slerpQuaternions(startQuat, targetQuat, eased);
      piece.rotation.setFromQuaternion(currentQuat);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        piece.position.copy(targetPos);
        piece.rotation.copy(piece.userData.targetRotation);
        this.pieceManager.setPieceSnapped(piece);
        this.playSnapEffect(piece);
      }
    };
    
    animate();
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  playSnapEffect(piece) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = piece.position.x;
      positions[i * 3 + 1] = piece.position.y;
      positions[i * 3 + 2] = piece.position.z;
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      velocities.push(velocity);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.1,
      transparent: true,
      opacity: 1
    });
    
    const particles = new THREE.Points(geometry, material);
    this.sceneManager.scene.add(particles);
    
    let frame = 0;
    const maxFrames = 30;
    
    const animateParticles = () => {
      frame++;
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        velocities[i].y -= 0.01;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      material.opacity = 1 - frame / maxFrames;
      
      if (frame < maxFrames) {
        requestAnimationFrame(animateParticles);
      } else {
        this.sceneManager.scene.remove(particles);
        geometry.dispose();
        material.dispose();
      }
    };
    
    animateParticles();
  }

  update(delta) {
    this.snapAnimations.forEach((anim, key) => {
      anim.elapsed += delta;
      const progress = Math.min(anim.elapsed / anim.duration, 1);
      const eased = this.easeOutCubic(progress);
      
      anim.piece.position.lerpVectors(anim.startPos, anim.targetPos, eased);
      
      const currentQuat = new THREE.Quaternion();
      currentQuat.slerpQuaternions(anim.startQuat, anim.targetQuat, eased);
      anim.piece.rotation.setFromQuaternion(currentQuat);
      
      if (progress >= 1) {
        anim.piece.position.copy(anim.targetPos);
        anim.piece.rotation.copy(anim.piece.userData.targetRotation);
        this.snapAnimations.delete(key);
      }
    });
  }
}

export default SnapDetector;
