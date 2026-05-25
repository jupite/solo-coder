import React from 'react';
import { Player } from '../types';
import { PLAYER_HEIGHT, PLAYER_RADIUS } from '../utils/constants';

interface PlayerMeshProps {
  player: Player;
}

export const PlayerMesh: React.FC<PlayerMeshProps> = ({ player }) => {
  const { position, color, isControlled, role } = player;

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position={[0, PLAYER_HEIGHT / 2 - 0.3, 0]} castShadow>
        <cylinderGeometry args={[PLAYER_RADIUS * 0.6, PLAYER_RADIUS * 0.8, PLAYER_HEIGHT * 0.6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, PLAYER_HEIGHT - 0.3, 0]} castShadow>
        <sphereGeometry args={[PLAYER_RADIUS * 0.5, 16, 16]} />
        <meshStandardMaterial color="#f5d0a9" />
      </mesh>

      <mesh position={[0, PLAYER_HEIGHT * 0.3, 0]} castShadow>
        <cylinderGeometry args={[PLAYER_RADIUS * 0.7, PLAYER_RADIUS * 0.7, PLAYER_HEIGHT * 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[PLAYER_RADIUS * 0.4, 0.4, PLAYER_RADIUS * 0.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {isControlled && (
        <>
          <mesh position={[0, PLAYER_HEIGHT + 0.5, 0]}>
            <coneGeometry args={[0.3, 0.6, 4]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <pointLight
            position={[0, PLAYER_HEIGHT + 0.5, 0]}
            color="#fbbf24"
            intensity={0.5}
            distance={3}
          />
        </>
      )}

      {role === 'goalkeeper' && (
        <mesh position={[0, PLAYER_HEIGHT / 2, 0]}>
          <boxGeometry args={[PLAYER_RADIUS * 1.2, PLAYER_HEIGHT * 0.8, 0.2]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};
