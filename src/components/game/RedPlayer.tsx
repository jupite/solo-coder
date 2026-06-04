import type { Position, Direction } from '@/lib/game/types';
import { useSkin } from './SkinProvider';

interface RedPlayerProps {
  position: Position;
  direction?: Direction;
}

const DIRECTION_ROTATION: Record<Direction, number> = {
  up: 0,
  right: Math.PI / 2,
  down: Math.PI,
  left: -Math.PI / 2,
};

export function RedPlayer({ position, direction = 'down' }: RedPlayerProps) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.redPlayer;

  return (
    <group position={[position.x, 0, position.y]} rotation={[0, DIRECTION_ROTATION[direction], 0]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={skin.emissiveIntensity}
          metalness={skin.metalness}
          roughness={skin.roughness}
        />
      </mesh>

      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={skin.emissiveIntensity * 2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}