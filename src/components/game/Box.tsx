import { RoundedBox } from '@react-three/drei';
import type { Position } from '@/lib/game/types';

interface BoxProps {
  position: Position;
  isOnTarget?: boolean;
}

export function Box({ position, isOnTarget = false }: BoxProps) {
  return (
    <group position={[position.x, 0.46, position.y]}>
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
