import React from 'react';
import { Canvas } from '@react-three/fiber';
import { IceRink } from './IceRink';
import { CurlingStone } from './CurlingStone';
import { useGameStore } from '@/store/useGameStore';
import { RINK_DIMENSIONS } from '@/types/game';

export const PreviewScene: React.FC = () => {
  const { stones } = useGameStore();

  return (
    <Canvas
      camera={{
        position: [0, 15, -RINK_DIMENSIONS.length / 2 + 8],
        fov: 60,
        near: 0.1,
        far: 100,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1a1a2e']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      <group position={[0, 0, 0]}>
        {stones.map((stone) => (
          <CurlingStone key={stone.id} stone={stone} />
        ))}

        <group position={[0, 0, -RINK_DIMENSIONS.length / 2 + 6]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[1.83, 64]} />
            <meshBasicMaterial color="#3366CC" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <circleGeometry args={[1.22, 64]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
            <circleGeometry args={[0.61, 64]} />
            <meshBasicMaterial color="#CC3333" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>
    </Canvas>
  );
};
