import { RoundedBox } from '@react-three/drei';
import type { Position } from '@/lib/game/types';

interface WallProps {
  position: Position;
}

export function Wall({ position }: WallProps) {
  return (
    <RoundedBox
      args={[0.92, 0.92, 0.92]}
      radius={0.08}
      smoothness={2}
      position={[position.x, 0.46, position.y]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#374151"
        metalness={0.4}
        roughness={0.7}
      />
    </RoundedBox>
  );
}
