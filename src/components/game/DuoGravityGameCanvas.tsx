'use client';

import { Suspense, useEffect, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Board } from './Board';
import { Wall } from './Wall';
import { CellType } from '@/lib/game/types';
import { Box } from './Box';
import { Target } from './Target';
import { GravityPlayer } from './GravityPlayer';
import { GravityRedPlayer } from './GravityRedPlayer';
import type { DuoGravityGameState, DuoGravityLevelData } from '@/lib/game/types';

interface DuoGravityGameCanvasProps {
  gameState: DuoGravityGameState;
  levelData: DuoGravityLevelData;
}

const CameraSetup = memo(function CameraSetup({ centerX, centerZ, distance, zoom }: { centerX: number; centerZ: number; distance: number; zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(centerX, distance * 2, centerZ);
    camera.rotation.set(-Math.PI / 2, 0, 0);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, centerX, centerZ, distance, zoom]);

  return null;
});

const InnerCanvas = memo(function InnerCanvas({
  gameState,
  levelData,
  centerX,
  centerZ,
  cameraDistance,
  zoom,
}: DuoGravityGameCanvasProps & { centerX: number; centerZ: number; cameraDistance: number; zoom: number }) {
  return (
    <>
      <OrthographicCamera makeDefault near={0.1} far={500} />
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
        <Board grid={levelData.grid} />

        {levelData.grid.map((row, r) =>
          row.map((cell, c) =>
            cell === CellType.WALL ? (
              <Wall key={`w-${r}-${c}`} position={{ x: c, y: r }} />
            ) : null,
          ),
        )}

        {levelData.targets.map((pos, idx) => (
          <Target key={`target-${idx}`} position={pos} />
        ))}

        {gameState.boxes.map((pos, idx) => {
          const isOnTarget = levelData.targets.some(
            (t) => t.x === pos.x && t.y === pos.y,
          );
          return <Box key={`box-${idx}`} position={pos} isOnTarget={isOnTarget} />;
        })}

        <GravityPlayer position={gameState.bluePlayer.position} onTarget={gameState.bluePlayer.onTarget} />
        <GravityRedPlayer position={gameState.redPlayer.position} onTarget={gameState.redPlayer.onTarget} />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
});

export const DuoGravityGameCanvas = memo(function DuoGravityGameCanvas({ gameState, levelData }: DuoGravityGameCanvasProps) {
  const { grid } = levelData;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const centerX = (cols - 1) / 2;
  const centerZ = (rows - 1) / 2;
  const size = Math.max(rows, cols);
  const cameraDistance = size * 1.5;
  const zoom = Math.max(40, 80 - size * 8);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 450, position: 'relative' }}>
      <Canvas
        shadows
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', background: '#0a0f1e' }}
      >
        <InnerCanvas
          gameState={gameState}
          levelData={levelData}
          centerX={centerX}
          centerZ={centerZ}
          cameraDistance={cameraDistance}
          zoom={zoom}
        />
      </Canvas>
    </div>
  );
});
