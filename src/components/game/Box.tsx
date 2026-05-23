import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import type { Position } from '@/lib/game/types';

interface BoxProps {
  position: Position;
  isOnTarget?: boolean;
}

export function Box({ position, isOnTarget = false }: BoxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(position.x, 0.46, position.y));

  targetPos.current.set(position.x, 0.46, position.y);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(targetPos.current, Math.min(1, delta * 12));
  });

  return (
    <group ref={groupRef}>
      <RoundedBox
        args={[0.82, 0.82, 0.82]}
        radius={0.06}
        smoothness={2}
        castShadow
        receiveShadow
      >
        {isOnTarget ? (
          <meshStandardMaterial
            color="#fcd34d"
            emissive="#f59e0b"
            emissiveIntensity={0.9}
            metalness={0.7}
            roughness={0.25}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color="#8b5a2b"
            metalness={0.1}
            roughness={0.85}
          />
        )}
      </RoundedBox>
    </group>
  );
}
