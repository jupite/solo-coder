import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { IceRink } from './IceRink';
import { CurlingStone } from './CurlingStone';
import { useGameStore } from '@/store/useGameStore';
import { RINK_DIMENSIONS } from '@/types/game';

const NEAR_HOUSE_Z = RINK_DIMENSIONS.length / 2 - 6;
const SERVE_Z = NEAR_HOUSE_Z;

interface CameraControllerProps {
  targetStoneId: string | null;
}

const CameraController: React.FC<CameraControllerProps> = ({ targetStoneId }) => {
  const { camera } = useThree();
  const { stones, gamePhase } = useGameStore();
  const controlsRef = useRef<any>(null);
  const hasFollowedRef = useRef(false);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (gamePhase === 'ready' || gamePhase === 'aiming') {
      hasFollowedRef.current = false;
      const targetPos = new THREE.Vector3(0, 10, SERVE_Z + 8);
      const targetLookAt = new THREE.Vector3(0, 0, SERVE_Z - 4);

      camera.position.lerp(targetPos, 0.05);
      controlsRef.current.target.lerp(targetLookAt, 0.05);
      controlsRef.current.update();
      return;
    }

    if (gamePhase === 'thrown' && targetStoneId) {
      const stone = stones.find((s) => s.id === targetStoneId);
      if (stone && stone.isMoving) {
        hasFollowedRef.current = true;
        const targetPos = new THREE.Vector3(
          stone.position.x * 0.5,
          8,
          stone.position.z + 10
        );
        const targetLookAt = new THREE.Vector3(
          stone.position.x * 0.5,
          0,
          stone.position.z
        );

        camera.position.lerp(targetPos, 0.05);
        controlsRef.current.target.lerp(targetLookAt, 0.05);
        controlsRef.current.update();
        return;
      }
    }

    if (gamePhase === 'thrown' && hasFollowedRef.current) {
      const stone = stones.find((s) => s.id === targetStoneId);
      if (stone && !stone.isMoving) {
        const targetPos = new THREE.Vector3(0, 10, SERVE_Z + 8);
        const targetLookAt = new THREE.Vector3(0, 0, SERVE_Z - 4);

        camera.position.lerp(targetPos, 0.03);
        controlsRef.current.target.lerp(targetLookAt, 0.03);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={5}
      maxDistance={30}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.5}
      target={[0, 0, SERVE_Z - 4]}
    />
  );
};

interface AimLineProps {
  direction: number;
  power: number;
  visible: boolean;
}

const AimLine: React.FC<AimLineProps> = ({ direction, power, visible }) => {
  if (!visible || power === 0) return null;

  const lineLength = (power / 100) * 20;
  const endX = -Math.sin(direction) * lineLength;
  const endZ = -Math.cos(direction) * lineLength;

  const points = [
    new THREE.Vector3(0, 0.1, SERVE_Z),
    new THREE.Vector3(endX, 0.1, SERVE_Z + endZ),
  ];

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#FFD700" linewidth={2} />
    </line>
  );
};

interface SceneContentProps {
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: () => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  const { stones, gamePhase, throwParams, currentStoneId } = useGameStore();

  return (
    <group
      onPointerDown={onMouseDown}
      onPointerMove={onMouseMove}
      onPointerUp={onMouseUp}
      onPointerLeave={onMouseUp}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <pointLight position={[10, 10, -10]} intensity={0.5} />

      <IceRink />

      {stones.map((stone) => (
        <CurlingStone key={stone.id} stone={stone} />
      ))}

      <AimLine
        direction={throwParams.direction}
        power={throwParams.power}
        visible={gamePhase === 'aiming'}
      />

      <CameraController targetStoneId={currentStoneId} />
    </group>
  );
};

export const GameScene: React.FC = () => {
  const {
    gamePhase,
    startAiming,
    setDragStart,
    setDragEnd,
    releaseStone,
    setIsDragging,
    isDragging,
  } = useGameStore();

  const handleMouseDown = (e: any) => {
    if (gamePhase === 'ready') {
      startAiming();
    }

    if (gamePhase === 'aiming' || gamePhase === 'ready') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging && (gamePhase === 'aiming' || gamePhase === 'ready')) {
      setDragEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && gamePhase === 'aiming') {
      releaseStone();
    }
    setIsDragging(false);
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, SERVE_Z + 8], fov: 50 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 30, 80]} />
      <SceneContent
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </Canvas>
  );
};
