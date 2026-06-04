'use client';

import { RoundedBox } from '@react-three/drei';
import type { Position } from '@/lib/game/types';
import { useSkin } from './SkinProvider';

export function Wall({ position }: { position: Position }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.wall;

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
        color={skin.color}
        metalness={skin.metalness}
        roughness={skin.roughness}
      />
    </RoundedBox>
  );
}
