import * as THREE from 'three';

export class CollisionDetector {
  static checkProjectileBirds(projectile, birds) {
    if (!projectile.isActive) return null;
    
    const projectileBox = projectile.getBoundingBox();
    
    for (let i = 0; i < birds.length; i++) {
      const bird = birds[i];
      if (!bird.isAlive) continue;
      
      const birdBox = bird.getBoundingBox();
      
      if (projectileBox.intersectsBox(birdBox)) {
        return bird;
      }
    }
    
    return null;
  }

  static checkSphereCollision(pos1, radius1, pos2, radius2) {
    const distance = pos1.distanceTo(pos2);
    return distance < radius1 + radius2;
  }
}
