import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { RINK_DIMENSIONS, COLORS } from '@/types/game';

const TARGET_Z = -RINK_DIMENSIONS.length / 2 + 6;

const PreviewCamera: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 12, TARGET_Z + 4);
    camera.lookAt(0, 0, TARGET_Z);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
};

const PreviewStone: React.FC<{ x: number; z: number; player: 1 | 2 }> = ({ x, z, player }) => {
  const color = player === 1 ? COLORS.player1 : COLORS.player2;

  return (
    <group position={[x, RINK_DIMENSIONS.stoneHeight / 2, z]}>
      <mesh>
        <cylinderGeometry
          args={[RINK_DIMENSIONS.stoneRadius, RINK_DIMENSIONS.stoneRadius, RINK_DIMENSIONS.stoneHeight * 0.7, 32]}
        />
        <meshStandardMaterial color="#444444" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, RINK_DIMENSIONS.stoneHeight * 0.35 + 0.01, 0]}>
        <cylinderGeometry
          args={[RINK_DIMENSIONS.stoneRadius * 0.9, RINK_DIMENSIONS.stoneRadius * 0.9, 0.02, 32]}
        />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      <mesh position={[0, -RINK_DIMENSIONS.stoneHeight * 0.35 - 0.01, 0]}>
        <cylinderGeometry
          args={[RINK_DIMENSIONS.stoneRadius * 0.9, RINK_DIMENSIONS.stoneRadius * 0.9, 0.02, 32]}
        />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
    </group>
  );
};

export const PreviewScene: React.FC = () => {
  const stones = useGameStore((s) => s.stones);

  return (
    <Canvas
      camera={{
        position: [0, 12, TARGET_Z + 4],
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <PreviewCamera />
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, TARGET_Z]}>
        <planeGeometry args={[RINK_DIMENSIONS.width, 8]} />
        <meshStandardMaterial color={COLORS.ice} roughness={0.05} metalness={0.1} />
      </mesh>

      <group position={[0, 0, TARGET_Z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <circleGeometry args={[1.83, 64]} />
          <meshBasicMaterial color={COLORS.targetBlue} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <circleGeometry args={[1.22, 64]} />
          <meshBasicMaterial color={COLORS.targetWhite} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <circleGeometry args={[0.61, 64]} />
          <meshBasicMaterial color={COLORS.targetRed} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color={COLORS.targetCenter} />
        </mesh>
      </group>

      {stones
        .filter((s) => {
          const dz = Math.abs(s.position.z - TARGET_Z);
          return dz < 6;
        })
        .map((stone) => (
          <PreviewStone
            key={stone.id}
            x={stone.position.x}
            z={stone.position.z}
            player={stone.player}
          />
        ))}
    </Canvas>
  );
};
