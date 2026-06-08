'use client';

import type { Position } from '@/lib/game/types';
import { useSkin } from './SkinProvider';

export function GravityPlayer({ position, onTarget = false }: { position: Position; onTarget?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.player;

  const color = onTarget ? '#22c55e' : skin.color;
  const emissive = onTarget ? '#22c55e' : skin.emissive;
  const emissiveIntensity = onTarget ? 0.8 : skin.emissiveIntensity;

  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={skin.metalness}
          roughness={skin.roughness}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={onTarget ? 1.5 : skin.emissiveIntensity * 2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
