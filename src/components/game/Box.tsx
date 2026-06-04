'use client';

import { RoundedBox } from '@react-three/drei';
import type { Position } from '@/lib/game/types';
import { useSkin } from './SkinProvider';

export function Box({ position, isOnTarget = false }: { position: Position; isOnTarget?: boolean }) {
  const { currentSkin } = useSkin();

  let color: string;
  let emissive: string;
  let emissiveIntensity: number;
  let metalness: number;
  let roughness: number;
  let toneMapped: boolean;

  if (isOnTarget) {
    const skin = currentSkin.boxOnTarget;
    color = skin.color;
    emissive = skin.emissive;
    emissiveIntensity = skin.emissiveIntensity;
    metalness = skin.metalness;
    roughness = skin.roughness;
    toneMapped = false;
  } else {
    const skin = currentSkin.box;
    color = skin.color;
    emissive = '#000000';
    emissiveIntensity = 0;
    metalness = skin.metalness;
    roughness = skin.roughness;
    toneMapped = true;
  }

  return (
    <group position={[position.x, 0.46, position.y]}>
      <RoundedBox
        args={[0.82, 0.82, 0.82]}
        radius={0.06}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={metalness}
          roughness={roughness}
          toneMapped={toneMapped}
        />
      </RoundedBox>
    </group>
  );
}
