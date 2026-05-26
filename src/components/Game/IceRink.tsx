import React from 'react';
import { RINK_DIMENSIONS, COLORS } from '@/types/game';

export const IceRink: React.FC = () => {
  const { length, width } = RINK_DIMENSIONS;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[width + 2, length + 2]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color={COLORS.ice}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[width - 0.1, length - 0.1]} />
        <meshBasicMaterial color={COLORS.iceBorder} transparent opacity={0.3} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * (length / 2 - 6)]}>
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
      ))}

      <group position={[0, 0.05, 0]}>
        {[-width / 2, width / 2].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]}>
            <boxGeometry args={[0.05, 0.2, length]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
        {[-length / 2, length / 2].map((z) => (
          <mesh key={z} position={[0, 0.1, z]}>
            <boxGeometry args={[width, 0.2, 0.05]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
      </group>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.006, side * (length / 2 - 9.144)]}
        >
          <planeGeometry args={[width, 0.02]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={0.5} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[width, 0.02]} />
        <meshBasicMaterial color="#0000FF" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};
