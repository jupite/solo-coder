import type { Position } from '@/lib/game/types';

interface SwitchTileProps {
  position: Position;
  isActive?: boolean;
}

export function SwitchTile({ position, isActive = false }: SwitchTileProps) {
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial
          color="#3a2a0a"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial
          color={isActive ? '#22c55e' : '#64748b'}
          emissive={isActive ? '#16a34a' : '#475569'}
          emissiveIntensity={isActive ? 0.9 : 0.4}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshStandardMaterial
          color={isActive ? '#4ade80' : '#94a3b8'}
          emissive={isActive ? '#22c55e' : '#64748b'}
          emissiveIntensity={isActive ? 0.6 : 0.2}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
      {!isActive && (
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.28, 0.04, 0.06]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}