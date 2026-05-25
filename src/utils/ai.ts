import * as THREE from 'three';
import { Player } from '../types';
import {
  FIELD_LENGTH,
  FIELD_WIDTH,
  BALL_CONTROL_DISTANCE,
  PASS_DISTANCE,
  KICK_POWER,
  PASS_POWER,
  SHOOT_POWER,
  GOAL_WIDTH,
} from './constants';

export const findNearestPlayer = (
  position: THREE.Vector3,
  players: Player[],
  excludeId?: string
): Player | null => {
  let nearest: Player | null = null;
  let minDist = Infinity;

  players.forEach((player) => {
    if (player.id === excludeId) return;
    const dist = position.distanceTo(player.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = player;
    }
  });

  return nearest;
};

export const findNearestTeammate = (
  position: THREE.Vector3,
  team: 'home' | 'away',
  players: Player[],
  excludeId?: string
): Player | null => {
  const teammates = players.filter((p) => p.team === team && p.id !== excludeId);
  return findNearestPlayer(position, teammates);
};

export const findNearestOpponent = (
  position: THREE.Vector3,
  team: 'home' | 'away',
  players: Player[]
): Player | null => {
  const opponents = players.filter((p) => p.team !== team);
  return findNearestPlayer(position, opponents);
};

export const getGoalPosition = (team: 'home' | 'away'): THREE.Vector3 => {
  return new THREE.Vector3(0, 0, team === 'home' ? FIELD_LENGTH / 2 : -FIELD_LENGTH / 2);
};

export const calculatePassTarget = (
  from: THREE.Vector3,
  to: THREE.Vector3,
  power: number = PASS_POWER
): THREE.Vector3 => {
  const direction = to.clone().sub(from).normalize();
  return from.clone().add(direction.multiplyScalar(power));
};

export const calculateShootTarget = (
  from: THREE.Vector3,
  team: 'home' | 'away'
): THREE.Vector3 => {
  const goalPos = getGoalPosition(team === 'home' ? 'away' : 'home');
  const targetX = (Math.random() - 0.5) * GOAL_WIDTH * 0.8;
  const targetY = 1 + Math.random() * 2;
  const targetZ = goalPos.z;

  return new THREE.Vector3(targetX, targetY, targetZ);
};

export const calculateAIMovement = (
  player: Player,
  ballPosition: THREE.Vector3,
  ballOwnedBy: string | null,
  players: Player[],
  deltaTime: number,
  randomSeed?: number
): {
  targetPosition: THREE.Vector3;
  shouldKick: boolean;
  kickTarget?: THREE.Vector3;
  kickPower?: number;
  isGoalkeeperKickoff?: boolean;
} => {
  const isHomeTeam = player.team === 'home';
  const isGoalkeeper = player.role === 'goalkeeper';

  if (isGoalkeeper) {
    const goalZ = isHomeTeam ? -FIELD_LENGTH / 2 + 2 : FIELD_LENGTH / 2 - 2;
    const goalDir = isHomeTeam ? -1 : 1;

    if (ballOwnedBy === player.id) {
      const forwardDir = isHomeTeam ? 1 : -1;
      const kickTarget = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        4,
        goalZ + forwardDir * 50
      );
      return {
        targetPosition: player.position.clone(),
        shouldKick: true,
        kickTarget,
        kickPower: KICK_POWER * 1.5,
        isGoalkeeperKickoff: true,
      };
    }

    let targetX = 0;
    let targetZ = goalZ;

    const ballToGoalDist = Math.abs(ballPosition.z - goalZ);
    
    if (ballOwnedBy) {
      const ballOwner = players.find((p) => p.id === ballOwnedBy);
      if (ballOwner && ballOwner.team !== player.team) {
        if (ballToGoalDist < 45) {
          const seed = randomSeed || 0.5;
          
          if (ballToGoalDist < 20) {
            targetX = clamp(ballPosition.x, -GOAL_WIDTH / 2, GOAL_WIDTH / 2);
            const advanceDist = Math.min(10, 20 - ballToGoalDist) * 0.6;
            targetZ = goalZ + goalDir * advanceDist;
          } else if (ballToGoalDist < 30) {
            if (seed > 0.6) {
              targetX = clamp(ballPosition.x, -GOAL_WIDTH / 2, GOAL_WIDTH / 2);
              const interceptZ = ballPosition.z + (goalZ - ballPosition.z) * 0.3;
              targetZ = clamp(interceptZ, goalZ - 8, goalZ + 5);
            } else {
              targetX = clamp(ballPosition.x * 0.7, -GOAL_WIDTH / 3, GOAL_WIDTH / 3);
              targetZ = goalZ;
            }
          } else {
            targetX = clamp(ballPosition.x * 0.5, -GOAL_WIDTH / 2, GOAL_WIDTH / 2);
            targetZ = goalZ;
          }
        }
      } else if (ballOwner && ballOwner.team === player.team) {
        if (ballToGoalDist < 50) {
          targetX = clamp(ballPosition.x * 0.4, -GOAL_WIDTH / 3, GOAL_WIDTH / 3);
        }
        targetZ = goalZ;
      }
    } else {
      if (ballToGoalDist < 40) {
        targetX = clamp(ballPosition.x * 0.8, -GOAL_WIDTH / 2, GOAL_WIDTH / 2);
        
        const ballMovingTowardsGoal = (ballPosition.z - goalZ) * goalDir > 0;
        if (ballMovingTowardsGoal && ballToGoalDist < 25) {
          const seed = randomSeed || 0.5;
          if (seed > 0.5) {
            targetZ = clamp(
              ballPosition.z + (goalZ - ballPosition.z) * 0.5,
              goalZ - 10,
              goalZ + 6
            );
          } else {
            targetZ = goalZ;
          }
        }
      }
    }

    const distToBall = player.position.distanceTo(ballPosition);
    if (distToBall < BALL_CONTROL_DISTANCE * 2.5 && !ballOwnedBy) {
      return {
        targetPosition: ballPosition.clone(),
        shouldKick: false,
      };
    }

    const targetPosition = new THREE.Vector3(targetX, 1, targetZ);
    return { targetPosition, shouldKick: false };
  }

  if (ballOwnedBy) {
    const ballOwner = players.find((p) => p.id === ballOwnedBy);

    if (ballOwner) {
      if (ballOwner.team === player.team) {
        if (player.id === ballOwner.id) {
          const goalPos = getGoalPosition(isHomeTeam ? 'away' : 'home');
          const distToGoal = player.position.distanceTo(goalPos);

          if (distToGoal < 30) {
            const shootTarget = calculateShootTarget(player.position, player.team);
            return {
              targetPosition: player.position,
              shouldKick: true,
              kickTarget: shootTarget,
              kickPower: SHOOT_POWER,
            };
          }

          const nearestTeammate = findNearestTeammate(
            player.position,
            player.team,
            players,
            player.id
          );

          if (nearestTeammate && Math.random() < 0.02) {
            return {
              targetPosition: player.position,
              shouldKick: true,
              kickTarget: nearestTeammate.position,
              kickPower: PASS_POWER,
            };
          }

          const moveTarget = goalPos.clone().sub(player.position).normalize();
          return {
            targetPosition: player.position
              .clone()
              .add(moveTarget.multiplyScalar(5)),
            shouldKick: false,
          };
        }

        const supportPosition = ballOwner.position.clone();
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10
        );
        supportPosition.add(offset);

        return {
          targetPosition: supportPosition,
          shouldKick: false,
        };
      } else {
        const distToBall = player.position.distanceTo(ballPosition);

        if (distToBall < BALL_CONTROL_DISTANCE * 1.5) {
          return {
            targetPosition: ballPosition.clone(),
            shouldKick: false,
          };
        }

        const defendPosition = ballOwner.position.clone();
        const goalPos = getGoalPosition(isHomeTeam ? 'home' : 'away');
        const defendOffset = goalPos
          .clone()
          .sub(ballOwner.position)
          .normalize()
          .multiplyScalar(3);
        defendPosition.add(defendOffset);

        return {
          targetPosition: defendPosition,
          shouldKick: false,
        };
      }
    }
  }

  const distToBall = player.position.distanceTo(ballPosition);

  if (distToBall < BALL_CONTROL_DISTANCE) {
    return {
      targetPosition: ballPosition.clone(),
      shouldKick: false,
    };
  }

  return {
    targetPosition: ballPosition.clone(),
    shouldKick: false,
  };
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
