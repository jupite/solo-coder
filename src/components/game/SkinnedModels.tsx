'use client';

import { RoundedBox } from '@react-three/drei';
import type { Position, Direction } from '@/lib/game/types';
import { useSkin } from './SkinProvider';

const DIRECTION_ROTATION: Record<Direction, number> = {
  up: 0,
  right: Math.PI / 2,
  down: Math.PI,
  left: -Math.PI / 2,
};

export function SkinnedPlayer({ position, direction = 'down' }: { position: Position; direction?: Direction }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.player;

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

export function SkinnedRedPlayer({ position, direction = 'down' }: { position: Position; direction?: Direction }) {
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

export function SkinnedBox({ position, isOnTarget = false }: { position: Position; isOnTarget?: boolean }) {
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

export function SkinnedWall({ position }: { position: Position }) {
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

export function SkinnedTarget({ position }: { position: Position }) {
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

export function SkinnedSwitchTile({ position, isActive = false }: { position: Position; isActive?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.switchTile;
  const activeColor = isActive ? skin.onColor : skin.offColor;

  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#3a2a0a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={isActive ? 0.9 : 0.4}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
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
            color={skin.offColor}
            emissive={skin.offColor}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function SkinnedRedGate({ position, isOpen = false }: { position: Position; isOpen?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin.redGate;

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
            color={skin.color}
            emissive={skin.emissive}
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
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </RoundedBox>
      <mesh position={[0, 0.46, 0.47]}>
        <boxGeometry args={[0.6, 0.6, 0.02]} />
        <meshStandardMaterial
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
