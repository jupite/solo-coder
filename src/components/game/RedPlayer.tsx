'use client';

import type { Position, Direction } from '@/lib/game/types';
import { useSkin } from './SkinProvider';
import { DIRECTION_ROTATION } from './Player';

export function RedPlayer({ position, direction = 'down' }: { position: Position; direction?: Direction }) {
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
