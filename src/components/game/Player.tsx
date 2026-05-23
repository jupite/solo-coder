import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Position, Direction } from '@/lib/game/types';

interface PlayerProps {
  position: Position;
  direction?: Direction;
}

const DIRECTION_ROTATION: Record<Direction, number> = {
  up: 0,
  right: Math.PI / 2,
  down: Math.PI,
  left: -Math.PI / 2,
};

export function Player({ position, direction = 'down' }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(position.x, 0, position.y));
  const targetRot = useRef(new THREE.Euler(0, DIRECTION_ROTATION[direction], 0));

  targetPos.current.set(position.x, 0, position.y);
  targetRot.current.set(0, DIRECTION_ROTATION[direction], 0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(targetPos.current, Math.min(1, delta * 12));
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRot.current.y,
      Math.min(1, delta * 10),
    );
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.35}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
