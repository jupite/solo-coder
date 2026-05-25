import * as THREE from 'three';
import {
  BALL_RADIUS,
  BALL_FRICTION,
  BALL_BOUNCE,
  BALL_MAX_SPEED,
  FIELD_LENGTH,
  FIELD_WIDTH,
  GOAL_WIDTH,
  GOAL_HEIGHT,
  PLAYER_RADIUS,
} from './constants';

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const distance = (a: THREE.Vector3, b: THREE.Vector3): number => {
  return a.distanceTo(b);
};

export const normalize = (v: THREE.Vector3): THREE.Vector3 => {
  const result = v.clone();
  result.normalize();
  return result;
};

export const reflect = (
  velocity: THREE.Vector3,
  normal: THREE.Vector3
): THREE.Vector3 => {
  const dot = velocity.dot(normal);
  return velocity.clone().sub(normal.clone().multiplyScalar(2 * dot));
};

export const updateBallPhysics = (
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  deltaTime: number
): { position: THREE.Vector3; velocity: THREE.Vector3; scored: 'home' | 'away' | null } => {
  const newPosition = position.clone();
  const newVelocity = velocity.clone();

  const gravity = 25;
  newVelocity.y -= gravity * deltaTime;

  newVelocity.multiplyScalar(BALL_FRICTION);

  if (newVelocity.length() > BALL_MAX_SPEED) {
    newVelocity.setLength(BALL_MAX_SPEED);
  }

  newPosition.add(newVelocity.clone().multiplyScalar(deltaTime));

  let scored: 'home' | 'away' | null = null;

  const inHomeGoalArea = 
    newPosition.z <= -FIELD_LENGTH / 2 + 1 &&
    Math.abs(newPosition.x) <= GOAL_WIDTH / 2 &&
    newPosition.y <= GOAL_HEIGHT;

  const inAwayGoalArea = 
    newPosition.z >= FIELD_LENGTH / 2 - 1 &&
    Math.abs(newPosition.x) <= GOAL_WIDTH / 2 &&
    newPosition.y <= GOAL_HEIGHT;

  if (inHomeGoalArea) {
    scored = 'away';
  } else if (inAwayGoalArea) {
    scored = 'home';
  }

  if (!inHomeGoalArea && !inAwayGoalArea) {
    if (newPosition.z <= -FIELD_LENGTH / 2 + BALL_RADIUS) {
      newPosition.z = -FIELD_LENGTH / 2 + BALL_RADIUS;
      newVelocity.z = -newVelocity.z * BALL_BOUNCE;
    }

    if (newPosition.z >= FIELD_LENGTH / 2 - BALL_RADIUS) {
      newPosition.z = FIELD_LENGTH / 2 - BALL_RADIUS;
      newVelocity.z = -newVelocity.z * BALL_BOUNCE;
    }
  }

  if (newPosition.x <= -FIELD_WIDTH / 2 + BALL_RADIUS) {
    newPosition.x = -FIELD_WIDTH / 2 + BALL_RADIUS;
    newVelocity.x = -newVelocity.x * BALL_BOUNCE;
  }

  if (newPosition.x >= FIELD_WIDTH / 2 - BALL_RADIUS) {
    newPosition.x = FIELD_WIDTH / 2 - BALL_RADIUS;
    newVelocity.x = -newVelocity.x * BALL_BOUNCE;
  }

  if (newPosition.y <= BALL_RADIUS) {
    newPosition.y = BALL_RADIUS;
    if (Math.abs(newVelocity.y) < 1) {
      newVelocity.y = 0;
    } else {
      newVelocity.y = -newVelocity.y * BALL_BOUNCE * 0.8;
    }
    newVelocity.x *= 0.95;
    newVelocity.z *= 0.95;
  }

  return { position: newPosition, velocity: newVelocity, scored };
};

export const checkBallPlayerCollision = (
  ballPosition: THREE.Vector3,
  ballVelocity: THREE.Vector3,
  playerPosition: THREE.Vector3
): { collided: boolean; newVelocity: THREE.Vector3 } => {
  const distance = ballPosition.distanceTo(playerPosition);
  const minDistance = BALL_RADIUS + PLAYER_RADIUS;

  if (distance < minDistance) {
    const normal = normalize(
      ballPosition.clone().sub(playerPosition)
    );
    const newVelocity = reflect(ballVelocity, normal).multiplyScalar(BALL_BOUNCE);
    return { collided: true, newVelocity };
  }

  return { collided: false, newVelocity: ballVelocity };
};

export const checkPlayerPlayerCollision = (
  pos1: THREE.Vector3,
  pos2: THREE.Vector3
): boolean => {
  return pos1.distanceTo(pos2) < PLAYER_RADIUS * 2;
};

export const separatePlayers = (
  pos1: THREE.Vector3,
  pos2: THREE.Vector3
): { pos1: THREE.Vector3; pos2: THREE.Vector3 } => {
  const diff = pos1.clone().sub(pos2);
  const dist = diff.length();
  const minDist = PLAYER_RADIUS * 2;

  if (dist < minDist && dist > 0) {
    const separation = (minDist - dist) / 2;
    const direction = normalize(diff);
    return {
      pos1: pos1.clone().add(direction.multiplyScalar(separation)),
      pos2: pos2.clone().sub(direction.multiplyScalar(separation)),
    };
  }

  return { pos1, pos2 };
};
