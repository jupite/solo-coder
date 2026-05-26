import { RoundedBox } from '@react-three/drei';
import type { Position } from '@/lib/game/types';

interface RedGateProps {
  position: Position;
  isOpen?: boolean;
}

export function RedGate({ position, isOpen = false }: RedGateProps) {
  if (isOpen) {
    return (
      <group position={[position.x, 0, position.y]}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.92, 0.08, 0.92]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.2}
            roughness={0.8}
            emissive="#0b1f3a"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 32]} />
          <meshStandardMaterial
            color="#fca5a5"
            emissive="#ef4444"
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[position.x, 0, position.y]}>
      <RoundedBox
        args={[0.92, 0.92, 0.92]}
        radius={0.08}
        smoothness={2}
        position={[0, 0.46, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#991b1b"
          emissive="#ef4444"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </RoundedBox>
      <mesh position={[0, 0.46, 0.47]}>
        <boxGeometry args={[0.6, 0.6, 0.02]} />
        <meshStandardMaterial
          color="#fca5a5"
          emissive="#ef4444"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}