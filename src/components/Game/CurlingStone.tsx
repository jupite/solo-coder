import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stone, RINK_DIMENSIONS, COLORS } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';

interface CurlingStoneProps {
  stone: Stone;
}

export const CurlingStone: React.FC<CurlingStoneProps> = ({ stone }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { updateStonePosition, stopStone, stones } = useGameStore();

  const currentVel = useRef({ x: stone.velocity.x, z: stone.velocity.z });

  useEffect(() => {
    currentVel.current = { x: stone.velocity.x, z: stone.velocity.z };
  }, [stone.velocity]);

  useFrame((_, delta) => {
    if (!meshRef.current || !stone.isMoving) return;

    const friction = 0.995;
    const minVelocity = 0.001;

    let velX = currentVel.current.x * friction;
    let velZ = currentVel.current.z * friction;

    const speed = Math.sqrt(velX * velX + velZ * velZ);
    if (speed < minVelocity) {
      stopStone(stone.id);
      currentVel.current = { x: 0, z: 0 };
      return;
    }

    let newX = meshRef.current.position.x + velX;
    let newZ = meshRef.current.position.z + velZ;

    const halfWidth = RINK_DIMENSIONS.width / 2 - RINK_DIMENSIONS.stoneRadius;
    const halfLength = RINK_DIMENSIONS.length / 2 - RINK_DIMENSIONS.stoneRadius;

    if (Math.abs(newX) > halfWidth) {
      newX = Math.sign(newX) * halfWidth;
      velX *= -0.5;
    }

    if (Math.abs(newZ) > halfLength) {
      newZ = Math.sign(newZ) * halfLength;
      velZ *= -0.5;
    }

    stones.forEach((otherStone) => {
      if (otherStone.id === stone.id) return;

      const dx = newX - otherStone.position.x;
      const dz = newZ - otherStone.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < RINK_DIMENSIONS.stoneRadius * 2) {
        const overlap = RINK_DIMENSIONS.stoneRadius * 2 - distance;
        const nx = dx / distance;
        const nz = dz / distance;

        newX += nx * overlap * 0.5;
        newZ += nz * overlap * 0.5;

        const relativeVelX = velX - otherStone.velocity.x;
        const relativeVelZ = velZ - otherStone.velocity.z;
        const velocityAlongNormal = relativeVelX * nx + relativeVelZ * nz;

        if (velocityAlongNormal > 0) return;

        const restitution = 0.8;
        const impulse = -(1 + restitution) * velocityAlongNormal / 2;

        velX += impulse * nx;
        velZ += impulse * nz;

        if (otherStone.isMoving) {
          const otherVelX = otherStone.velocity.x - impulse * nx;
          const otherVelZ = otherStone.velocity.z - impulse * nz;
          updateStonePosition(
            otherStone.id,
            { x: otherStone.position.x - nx * overlap * 0.5, z: otherStone.position.z - nz * overlap * 0.5 },
            { x: otherVelX, z: otherVelZ }
          );
        }
      }
    });

    meshRef.current.position.x = newX;
    meshRef.current.position.z = newZ;

    const rotationAngle = speed * delta * 10;
    meshRef.current.rotation.x += rotationAngle;

    currentVel.current = { x: velX, z: velZ };
    updateStonePosition(stone.id, { x: newX, z: newZ }, { x: velX, z: velZ });
  });

  const handleColor = stone.player === 1 ? COLORS.player1 : COLORS.player2;

  return (
    <group
      ref={meshRef}
      position={[stone.position.x, RINK_DIMENSIONS.stoneHeight / 2, stone.position.z]}
    >
      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[RINK_DIMENSIONS.stoneRadius, RINK_DIMENSIONS.stoneRadius, RINK_DIMENSIONS.stoneHeight * 0.7, 32]}
        />
        <meshStandardMaterial color="#444444" roughness={0.3} metalness={0.8} />
      </mesh>

      <mesh position={[0, RINK_DIMENSIONS.stoneHeight * 0.35 + 0.01, 0]}>
        <cylinderGeometry
          args={[RINK_DIMENSIONS.stoneRadius * 0.9, RINK_DIMENSIONS.stoneRadius * 0.9, 0.02, 32]}
        />
        <meshStandardMaterial color={handleColor} roughness={0.2} />
      </mesh>

      <mesh position={[0, -RINK_DIMENSIONS.stoneHeight * 0.35 - 0.01, 0]}>
        <cylinderGeometry
          args={[RINK_DIMENSIONS.stoneRadius * 0.9, RINK_DIMENSIONS.stoneRadius * 0.9, 0.02, 32]}
        />
        <meshStandardMaterial color={handleColor} roughness={0.2} />
      </mesh>

      <mesh position={[0, RINK_DIMENSIONS.stoneHeight * 0.5, 0]} castShadow>
        <torusGeometry args={[0.05, 0.015, 8, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.9} />
      </mesh>
    </group>
  );
};
