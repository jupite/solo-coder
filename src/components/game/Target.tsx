import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Position } from '@/lib/game/types';

interface TargetProps {
  position: Position;
}

export function Target({ position }: TargetProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    ringRef.current.rotation.y = t * 0.6;
    const scale = 1 + Math.sin(t * 2) * 0.04;
    ringRef.current.scale.set(scale, 1, scale);
  });

  return (
    <group position={[position.x, 0, position.y]}>
      <mesh ref={ringRef} position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.42, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={1.4}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>

      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fbbf24"
          emissiveIntensity={0.6}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
