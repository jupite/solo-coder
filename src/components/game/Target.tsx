import type { Position } from '@/lib/game/types';
import { useSkin } from './SkinProvider';

interface TargetProps {
  position: Position;
}

export function Target({ position }: TargetProps) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.target;

  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.42, 32]} />
        <meshStandardMaterial
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={skin.emissiveIntensity}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
          side={2}
          transparent
          opacity={0.95}
        />
      </mesh>

      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={skin.emissiveIntensity * 0.5}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
