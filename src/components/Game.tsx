import React, { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Field } from './Field';
import { PlayerMesh } from './Player';
import { Ball } from './Ball';
import { Goal } from './Goal';
import { HUD } from './HUD';
import { Controls } from './Controls';
import { useGameStore } from '../store/gameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import {
  updateBallPhysics,
  checkBallPlayerCollision,
  checkPlayerPlayerCollision,
  separatePlayers,
  distance,
} from '../utils/physics';
import {
  calculateAIMovement,
  findNearestTeammate,
  getGoalPosition,
  calculateShootTarget,
} from '../utils/ai';
import {
  FIELD_LENGTH,
  FIELD_WIDTH,
  BALL_RADIUS,
  PLAYER_RADIUS,
  BALL_CONTROL_DISTANCE,
  PASS_POWER,
  SHOOT_POWER,
  KICK_POWER,
  GAME_DURATION,
  PLAYER_SPRINT_MULTIPLIER,
  PENALTY_AREA_LENGTH,
  GOAL_WIDTH,
} from '../utils/constants';
import { Player } from '../types';

const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { players, controlledPlayerId, ballPosition } = useGameStore();

  useFrame(() => {
    const controlledPlayer = players.find((p) => p.id === controlledPlayerId);
    if (!controlledPlayer) return;

    const target = new THREE.Vector3(
      controlledPlayer.position.x,
      0,
      controlledPlayer.position.z
    );

    const cameraOffset = new THREE.Vector3(0, 25, -20);
    const targetCameraPos = target.clone().add(cameraOffset);

    camera.position.lerp(targetCameraPos, 0.05);
    camera.lookAt(target);
  });

  return null;
};

const GameLogic: React.FC = () => {
  const {
    players,
    setPlayers,
    ballPosition,
    ballVelocity,
    setBallPosition,
    setBallVelocity,
    ballOwnedBy,
    setBallOwnedBy,
    controlledPlayerId,
    setControlledPlayerId,
    score,
    setScore,
    time,
    setTime,
    isPaused,
    setIsPaused,
    isPlaying,
    setChargePower,
    setIsCharging,
  } = useGameStore();

  const { state: keyboardState, consumeActionRelease, consumeSwitch, consumePause } =
    useKeyboard();

  const lastTimeRef = useRef(performance.now());
  const actionCooldownRef = useRef(0);
  const chargeTimeRef = useRef(0);
  const goalkeeperKickoffRef = useRef<{ active: boolean; timer: number; team: 'home' | 'away' | null }>({
    active: false,
    timer: 0,
    team: null,
  });

  const handleGoal = useCallback(
    (team: 'home' | 'away') => {
      const newScore = { ...score };
      newScore[team] += 1;
      setScore(team, newScore[team]);

      const resetBallPos = new THREE.Vector3(0, BALL_RADIUS, 0);
      const resetBallVel = new THREE.Vector3();
      setBallPosition(resetBallPos);
      setBallVelocity(resetBallVel);
      setBallOwnedBy(null);

      const resetPlayers = players.map((p) => {
        const homePositions = [
          { x: 0, z: -35 },
          { x: -10, z: -15 },
          { x: 10, z: -15 },
        ];
        const awayPositions = [
          { x: 0, z: 35 },
          { x: -10, z: 15 },
          { x: 10, z: 15 },
        ];

        const teamPositions = p.team === 'home' ? homePositions : awayPositions;
        const index = parseInt(p.id.split('-')[1]);
        const pos = teamPositions[index];

        return {
          ...p,
          position: new THREE.Vector3(pos.x, 1, pos.z),
          velocity: new THREE.Vector3(),
          targetPosition: new THREE.Vector3(pos.x, 1, pos.z),
          hasBall: false,
          state: 'idle' as const,
        };
      });
      setPlayers(resetPlayers);
    },
    [score, players, setScore, setBallPosition, setBallVelocity, setBallOwnedBy, setPlayers]
  );

  useFrame((_, delta) => {
    if (consumePause()) {
      setIsPaused(!isPaused);
    }

    if (!isPlaying || isPaused) return;

    const now = performance.now();
    const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;

    if (actionCooldownRef.current > 0) {
      actionCooldownRef.current -= deltaTime;
    }

    const newTime = time + deltaTime;
    setTime(newTime);

    if (newTime >= GAME_DURATION) {
      return;
    }

    let newPlayers = players.map((p) => ({ ...p }));
    let newBallPos = ballPosition.clone();
    let newBallVel = ballVelocity.clone();
    let newBallOwnedBy = ballOwnedBy;

    const controlledPlayerIndex = newPlayers.findIndex(
      (p) => p.id === controlledPlayerId
    );

    if (controlledPlayerIndex >= 0) {
      const player = newPlayers[controlledPlayerIndex];
      const moveDir = new THREE.Vector3();

      if (keyboardState.current.forward) moveDir.z += 1;
      if (keyboardState.current.backward) moveDir.z -= 1;
      if (keyboardState.current.left) moveDir.x += 1;
      if (keyboardState.current.right) moveDir.x -= 1;

      if (goalkeeperKickoffRef.current.active && player.role !== 'goalkeeper') {
        const kickoffTeam = goalkeeperKickoffRef.current.team;
        const penaltyZ = kickoffTeam === 'home' ? -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH : FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH;
        
        if (kickoffTeam === 'home' && player.position.z < penaltyZ + 2) {
          moveDir.z = Math.max(0, moveDir.z);
        } else if (kickoffTeam === 'away' && player.position.z > penaltyZ - 2) {
          moveDir.z = Math.min(0, moveDir.z);
        }
      }

      if (moveDir.length() > 0) {
        moveDir.normalize();
        const speed = player.speed * (keyboardState.current.sprint ? PLAYER_SPRINT_MULTIPLIER : 1);
        player.velocity = moveDir.multiplyScalar(speed);
        player.state = 'running';
      } else {
        player.velocity.set(0, 0, 0);
        player.state = 'idle';
      }

      const newPos = player.position.clone().add(
        player.velocity.clone().multiplyScalar(deltaTime)
      );
      newPos.x = Math.max(-FIELD_WIDTH / 2 + PLAYER_RADIUS, Math.min(FIELD_WIDTH / 2 - PLAYER_RADIUS, newPos.x));
      newPos.z = Math.max(-FIELD_LENGTH / 2 + PLAYER_RADIUS, Math.min(FIELD_LENGTH / 2 - PLAYER_RADIUS, newPos.z));
      
      if (goalkeeperKickoffRef.current.active && player.role !== 'goalkeeper') {
        const kickoffTeam = goalkeeperKickoffRef.current.team;
        const penaltyZ = kickoffTeam === 'home' ? -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH : FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH;
        
        if (kickoffTeam === 'home') {
          newPos.z = Math.max(penaltyZ + 2, newPos.z);
        } else {
          newPos.z = Math.min(penaltyZ - 2, newPos.z);
        }

        if (player.team !== kickoffTeam) {
          if (kickoffTeam === 'home') {
            newPos.z = Math.max(newPos.z, 5);
          } else {
            newPos.z = Math.min(newPos.z, -5);
          }
        }
      }
      
      player.position.copy(newPos);
    }

    if (consumeSwitch()) {
      const homePlayers = newPlayers.filter(
        (p) => p.team === 'home' && p.role !== 'goalkeeper'
      );
      const currentIndex = homePlayers.findIndex((p) => p.id === controlledPlayerId);
      const nextIndex = (currentIndex + 1) % homePlayers.length;
      setControlledPlayerId(homePlayers[nextIndex].id);

      newPlayers.forEach((p) => {
        p.isControlled = p.id === homePlayers[nextIndex].id;
      });
    }

    if (keyboardState.current.actionCharging && !goalkeeperKickoffRef.current.active) {
      chargeTimeRef.current += deltaTime;
      setIsCharging(true);
      setChargePower(Math.min(chargeTimeRef.current, 2) / 2);
    } else {
      setIsCharging(false);
    }

    if (consumeActionRelease() && actionCooldownRef.current <= 0 && !goalkeeperKickoffRef.current.active) {
      const controlledPlayer = newPlayers.find((p) => p.id === controlledPlayerId);
      if (controlledPlayer) {
        const distToBall = controlledPlayer.position.distanceTo(newBallPos);
        const hasBall = newBallOwnedBy === controlledPlayer.id;

        if (distToBall < BALL_CONTROL_DISTANCE || hasBall) {
          const chargeTime = Math.min(chargeTimeRef.current, 2);
          const powerMultiplier = 0.5 + chargeTime * 0.5;

          const nearestTeammate = findNearestTeammate(
            controlledPlayer.position,
            controlledPlayer.team,
            newPlayers,
            controlledPlayer.id
          );

          if (nearestTeammate && chargeTime < 0.8) {
            const kickDir = nearestTeammate.position
              .clone()
              .sub(controlledPlayer.position)
              .normalize();
            newBallVel = kickDir.multiplyScalar(PASS_POWER * powerMultiplier);
            newBallVel.y = 2 + chargeTime * 2;
            newBallOwnedBy = null;
          } else {
            const goalPos = getGoalPosition(controlledPlayer.team === 'home' ? 'away' : 'home');
            const kickDir = goalPos.clone().sub(controlledPlayer.position).normalize();
            newBallVel = kickDir.multiplyScalar(SHOOT_POWER * powerMultiplier);
            newBallVel.y = 5 + chargeTime * 3;
            newBallOwnedBy = null;
          }

          actionCooldownRef.current = 0.3;
        }
      }
      chargeTimeRef.current = 0;
    }

    const goalkeeperWithBall = newPlayers.find(
      (p) => p.role === 'goalkeeper' && newBallOwnedBy === p.id
    );

    if (goalkeeperWithBall) {
      if (!goalkeeperKickoffRef.current.active) {
        goalkeeperKickoffRef.current = {
          active: true,
          timer: 3,
          team: goalkeeperWithBall.team,
        };
      }
    } else if (goalkeeperKickoffRef.current.active && newBallOwnedBy === null && newBallVel.length() > 2) {
      goalkeeperKickoffRef.current.active = false;
      goalkeeperKickoffRef.current.team = null;
    }

    if (goalkeeperKickoffRef.current.active) {
      goalkeeperKickoffRef.current.timer -= deltaTime;
      if (goalkeeperKickoffRef.current.timer <= 0) {
        goalkeeperKickoffRef.current.active = false;
        goalkeeperKickoffRef.current.team = null;
      }
    }

    newPlayers.forEach((player) => {
      if (player.isControlled) return;

      if (goalkeeperKickoffRef.current.active && player.role !== 'goalkeeper') {
        const kickoffTeam = goalkeeperKickoffRef.current.team;
        const penaltyZ = kickoffTeam === 'home' ? -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH : FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH;
        
        let targetZ = player.position.z;
        if (kickoffTeam === 'home') {
          if (player.position.z < penaltyZ) {
            targetZ = penaltyZ + 5;
          }
        } else {
          if (player.position.z > penaltyZ) {
            targetZ = penaltyZ - 5;
          }
        }

        if (player.team !== kickoffTeam) {
          const centerZ = 0;
          if (kickoffTeam === 'home' && player.position.z < 0) {
            targetZ = Math.max(player.position.z, 5);
          } else if (kickoffTeam === 'away' && player.position.z > 0) {
            targetZ = Math.min(player.position.z, -5);
          }
        }

        const randomSeed = Math.random();
        const aiResult = calculateAIMovement(
          player,
          newBallPos,
          newBallOwnedBy,
          newPlayers,
          deltaTime,
          randomSeed
        );

        const moveDir = new THREE.Vector3(
          aiResult.targetPosition.x - player.position.x,
          0,
          targetZ - player.position.z
        );

        if (moveDir.length() > 0.5) {
          moveDir.normalize();
          player.velocity = moveDir.multiplyScalar(player.speed * 0.8);
          player.state = 'running';
        } else {
          player.velocity.set(0, 0, 0);
          player.state = 'idle';
        }

        const newPos = player.position.clone().add(
          player.velocity.clone().multiplyScalar(deltaTime)
        );
        newPos.x = Math.max(-FIELD_WIDTH / 2 + PLAYER_RADIUS, Math.min(FIELD_WIDTH / 2 - PLAYER_RADIUS, newPos.x));
        newPos.z = Math.max(-FIELD_LENGTH / 2 + PLAYER_RADIUS, Math.min(FIELD_LENGTH / 2 - PLAYER_RADIUS, newPos.z));
        player.position.copy(newPos);
        return;
      }

      const randomSeed = Math.random();
      const aiResult = calculateAIMovement(
        player,
        newBallPos,
        newBallOwnedBy,
        newPlayers,
        deltaTime,
        randomSeed
      );

      player.targetPosition = aiResult.targetPosition;

      const moveDir = player.targetPosition
        .clone()
        .sub(player.position);
      moveDir.y = 0;

      if (moveDir.length() > 0.5) {
        moveDir.normalize();
        player.velocity = moveDir.multiplyScalar(player.speed * 0.8);
        player.state = 'running';
      } else {
        player.velocity.set(0, 0, 0);
        player.state = 'idle';
      }

      const newPos = player.position.clone().add(
        player.velocity.clone().multiplyScalar(deltaTime)
      );
      newPos.x = Math.max(-FIELD_WIDTH / 2 + PLAYER_RADIUS, Math.min(FIELD_WIDTH / 2 - PLAYER_RADIUS, newPos.x));
      newPos.z = Math.max(-FIELD_LENGTH / 2 + PLAYER_RADIUS, Math.min(FIELD_LENGTH / 2 - PLAYER_RADIUS, newPos.z));
      player.position.copy(newPos);

      if (aiResult.shouldKick) {
        const distToBall = player.position.distanceTo(newBallPos);
        const hasBall = newBallOwnedBy === player.id;
        if (distToBall < BALL_CONTROL_DISTANCE || hasBall) {
          const kickTarget = aiResult.kickTarget || getGoalPosition(player.team === 'home' ? 'away' : 'home');
          const kickDir = kickTarget.clone().sub(player.position).normalize();
          const power = aiResult.kickPower || KICK_POWER;
          newBallVel = kickDir.multiplyScalar(power);
          newBallVel.y = kickTarget.y > 0 ? kickTarget.y : 3;
          newBallOwnedBy = null;
          
          if (aiResult.isGoalkeeperKickoff) {
            goalkeeperKickoffRef.current.active = false;
            goalkeeperKickoffRef.current.team = null;
          }
        }
      }
    });

    for (let i = 0; i < newPlayers.length; i++) {
      for (let j = i + 1; j < newPlayers.length; j++) {
        if (checkPlayerPlayerCollision(newPlayers[i].position, newPlayers[j].position)) {
          const separated = separatePlayers(newPlayers[i].position, newPlayers[j].position);
          newPlayers[i].position.copy(separated.pos1);
          newPlayers[j].position.copy(separated.pos2);
        }
      }
    }

    const physicsResult = updateBallPhysics(newBallPos, newBallVel, deltaTime);
    newBallPos = physicsResult.position;
    newBallVel = physicsResult.velocity;

    if (physicsResult.scored) {
      handleGoal(physicsResult.scored);
      return;
    }

    newPlayers.forEach((player) => {
      const distToBall = player.position.distanceTo(newBallPos);
      const ballIsLow = newBallPos.y < 2;

      if (goalkeeperKickoffRef.current.active) {
        if (player.role !== 'goalkeeper') {
          return;
        }
      }

      if (distToBall < BALL_CONTROL_DISTANCE && newBallVel.length() < 5 && ballIsLow) {
        if (newBallOwnedBy === player.id) {
          const ballOffset = player.velocity.clone().normalize().multiplyScalar(1.5);
          if (player.velocity.length() > 0.1) {
            newBallPos.x = player.position.x + ballOffset.x;
            newBallPos.z = player.position.z + ballOffset.z;
          }
          newBallPos.y = BALL_RADIUS;
          newBallVel.set(0, 0, 0);

          const awayGoalZ = FIELD_LENGTH / 2;
          const homeGoalZ = -FIELD_LENGTH / 2;
          
          if (player.team === 'home' && newBallPos.z >= awayGoalZ - 1 && Math.abs(newBallPos.x) < GOAL_WIDTH / 2) {
            handleGoal('home');
            return;
          }
          if (player.team === 'away' && newBallPos.z <= homeGoalZ + 1 && Math.abs(newBallPos.x) < GOAL_WIDTH / 2) {
            handleGoal('away');
            return;
          }
        } else {
          newBallOwnedBy = player.id;
          player.hasBall = true;
          newPlayers.forEach((p) => {
            if (p.id !== player.id) p.hasBall = false;
          });
        }
      } else if (distToBall >= BALL_CONTROL_DISTANCE) {
        player.hasBall = false;
        if (newBallOwnedBy === player.id) {
          newBallOwnedBy = null;
        }
      }
    });

    newPlayers.forEach((player) => {
      const collision = checkBallPlayerCollision(
        newBallPos,
        newBallVel,
        player.position
      );
      if (collision.collided) {
        newBallVel = collision.newVelocity;
      }
    });

    setPlayers(newPlayers);
    setBallPosition(newBallPos);
    setBallVelocity(newBallVel);
    setBallOwnedBy(newBallOwnedBy);
  });

  return null;
};

export const Game: React.FC = () => {
  const { players, ballPosition, ballVelocity } = useGameStore();

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 25, -20], fov: 60 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#87ceeb']} />
        <fog attach="fog" args={['#87ceeb', 50, 150]} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight args={['#87ceeb', '#16a34a', 0.4]} />

        <CameraController />
        <GameLogic />

        <Field />
        <Goal />
        <Ball position={ballPosition} velocity={ballVelocity} />

        {players.map((player) => (
          <PlayerMesh key={player.id} player={player} />
        ))}

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.5}
          scale={120}
          blur={2}
          far={10}
        />
      </Canvas>

      <HUD />
      <Controls />
    </div>
  );
};
