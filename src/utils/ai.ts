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
  deltaTime: number
): {
  targetPosition: THREE.Vector3;
  shouldKick: boolean;
  kickTarget?: THREE.Vector3;
  kickPower?: number;
} => {
  const isHomeTeam = player.team === 'home';
  const isAwayTeam = player.team === 'away';
  const isGoalkeeper = player.role === 'goalkeeper';

  if (isGoalkeeper) {
    const goalX = 0;
    const goalZ = isHomeTeam ? -FIELD_LENGTH / 2 + 2 : FIELD_LENGTH / 2 - 2;

    let targetX = goalX;
    if (ballOwnedBy) {
      const ballOwner = players.find((p) => p.id === ballOwnedBy);
      if (ballOwner && ballOwner.team !== player.team) {
        targetX = clamp(ballPosition.x, -GOAL_WIDTH / 3, GOAL_WIDTH / 3);
      }
    }

    const targetPosition = new THREE.Vector3(targetX, 1, goalZ);
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
