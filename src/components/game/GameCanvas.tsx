'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
} from '@react-three/postprocessing';
import { Board } from './Board';
import { Wall } from './Wall';
import { CellType } from '@/lib/game/types';
import { Box } from './Box';
import { Player } from './Player';
import { Target } from './Target';
import type { GameState, LevelData } from '@/lib/game/types';

interface GameCanvasProps {
  gameState: GameState;
  levelData: LevelData;
}

function CameraSetup({ centerX, centerZ, distance, zoom }: { centerX: number; centerZ: number; distance: number; zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(centerX, distance, centerZ + distance);
    camera.rotation.set(-Math.PI / 4, 0, 0);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, centerX, centerZ, distance, zoom]);

  return null;
}

export function GameCanvas({ gameState, levelData }: GameCanvasProps) {
  const { grid } = levelData;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const centerX = (cols - 1) / 2;
  const centerZ = (rows - 1) / 2;
  const size = Math.max(rows, cols);
  const cameraDistance = size * 1.5;
  const zoom = size + 2;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 450, position: 'relative' }}>
      <Canvas
        shadows
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', background: '#0a0f1e' }}
      >
        <OrthographicCamera
          makeDefault
          near={0.1}
          far={500}
        />
        <CameraSetup centerX={centerX} centerZ={centerZ} distance={cameraDistance} zoom={zoom} />

        <ambientLight intensity={0.7} color="#c7d2fe" />
        <directionalLight
          position={[centerX + 5, 10, centerZ + 5]}
          intensity={1.0}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[centerX - 4, 6, centerZ - 4]}
          intensity={0.4}
          color="#818cf8"
        />

        <Suspense fallback={null}>
          <Board grid={grid} />

          {gameState.boxes.map((pos, idx) => {
            const isOnTarget = gameState.targets.some(
              (t) => t.x === pos.x && t.y === pos.y,
            );
            return <Box key={idx} position={pos} isOnTarget={isOnTarget} />;
          })}

          <Player position={gameState.player} direction="down" />

          {levelData.targets.map((pos, idx) => (
            <Target key={idx} position={pos} />
          ))}

          {grid.map((row, r) =>
            row.map((cell, c) =>
              cell === CellType.WALL ? (
                <Wall key={`w-${r}-${c}`} position={{ x: c, y: r }} />
              ) : null,
            ),
          )}
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
