import React from 'react';
import * as THREE from 'three';
import { BALL_RADIUS } from '../utils/constants';

interface BallProps {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export const Ball: React.FC<BallProps> = ({ position }) => {
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh castShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[BALL_RADIUS * 0.95, 32, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};
