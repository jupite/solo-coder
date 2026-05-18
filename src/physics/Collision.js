export class CollisionDetector {
  static checkSphereBox(sphere, box) {
    const closestPoint = {
      x: Math.max(box.min.x, Math.min(sphere.x, box.max.x)),
      y: Math.max(box.min.y, Math.min(sphere.y, box.max.y)),
      z: Math.max(box.min.z, Math.min(sphere.z, box.max.z))
    };

    const distance = {
      x: sphere.x - closestPoint.x,
      y: sphere.y - closestPoint.y,
      z: sphere.z - closestPoint.z
    };

    const distanceSquared =
      distance.x * distance.x +
      distance.y * distance.y +
      distance.z * distance.z;

    return distanceSquared < sphere.radius * sphere.radius;
  }

  static getCollisionNormal(sphere, box) {
    const closestPoint = {
      x: Math.max(box.min.x, Math.min(sphere.x, box.max.x)),
      y: Math.max(box.min.y, Math.min(sphere.y, box.max.y)),
      z: Math.max(box.min.z, Math.min(sphere.z, box.max.z))
    };

    const normal = {
      x: sphere.x - closestPoint.x,
      y: sphere.y - closestPoint.y,
      z: sphere.z - closestPoint.z
    };

    const length = Math.sqrt(
      normal.x * normal.x + normal.y * normal.y + normal.z * normal.z
    );

    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    } else {
      const centerToSphere = {
        x: sphere.x - (box.min.x + box.max.x) / 2,
        y: sphere.y - (box.min.y + box.max.y) / 2,
        z: sphere.z - (box.min.z + box.max.z) / 2
      };

      const absX = Math.abs(centerToSphere.x);
      const absY = Math.abs(centerToSphere.y);
      const absZ = Math.abs(centerToSphere.z);

      if (absX >= absY && absX >= absZ) {
        normal.x = Math.sign(centerToSphere.x);
        normal.y = 0;
        normal.z = 0;
      } else if (absY >= absX && absY >= absZ) {
        normal.x = 0;
        normal.y = Math.sign(centerToSphere.y);
        normal.z = 0;
      } else {
        normal.x = 0;
        normal.y = 0;
        normal.z = Math.sign(centerToSphere.z);
      }
    }

    return normal;
  }

  static reflectVelocity(velocity, normal, restitution = 1.0) {
    const dot = velocity.x * normal.x + velocity.y * normal.y + velocity.z * normal.z;

    return {
      x: velocity.x - (1 + restitution) * dot * normal.x,
      y: velocity.y - (1 + restitution) * dot * normal.y,
      z: velocity.z - (1 + restitution) * dot * normal.z
    };
  }

  static getBrickBox(brick) {
    const halfWidth = brick.width / 2;
    const halfHeight = brick.height / 2;
    const halfDepth = brick.depth / 2;

    return {
      min: {
        x: brick.position.x - halfWidth,
        y: brick.position.y - halfHeight,
        z: brick.position.z - halfDepth
      },
      max: {
        x: brick.position.x + halfWidth,
        y: brick.position.y + halfHeight,
        z: brick.position.z + halfDepth
      }
    };
  }

  static checkPaddleCollision(ball, paddle) {
    const paddleBox = {
      min: {
        x: paddle.position.x - paddle.width / 2,
        y: paddle.position.y - paddle.height / 2,
        z: paddle.position.z - paddle.depth / 2
      },
      max: {
        x: paddle.position.x + paddle.width / 2,
        y: paddle.position.y + paddle.height / 2,
        z: paddle.position.z + paddle.depth / 2
      }
    };

    const sphere = {
      x: ball.position.x,
      y: ball.position.y,
      z: ball.position.z,
      radius: ball.radius
    };

    if (!this.checkSphereBox(sphere, paddleBox)) {
      return null;
    }

    const normal = this.getCollisionNormal(sphere, paddleBox);

    if (normal.y > 0.5) {
      const hitPosX = (ball.position.x - paddle.position.x) / (paddle.width / 2);
      const hitPosZ = (ball.position.z - paddle.position.z) / (paddle.depth / 2);

      const angleFactor = 0.6;
      normal.x = hitPosX * angleFactor;
      normal.z = hitPosZ * angleFactor;
      normal.y = 1;

      const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
      normal.x /= len;
      normal.y /= len;
      normal.z /= len;
    }

    return normal;
  }
}
