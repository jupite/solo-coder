import React from 'react';
import {
  GOAL_WIDTH,
  GOAL_HEIGHT,
  GOAL_DEPTH,
  FIELD_LENGTH,
} from '../utils/constants';

const GoalNet: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const posts: [number, number, number][] = [
    [-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0],
    [GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0],
    [-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH],
    [GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH],
  ];

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[GOAL_WIDTH, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {posts.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.15, 0.15, GOAL_HEIGHT, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      <mesh position={[0, GOAL_HEIGHT, 0]}>
        <boxGeometry args={[GOAL_WIDTH + 0.4, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, GOAL_HEIGHT, -GOAL_DEPTH]}>
        <boxGeometry args={[GOAL_WIDTH + 0.4, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}>
        <boxGeometry args={[0.2, 0.2, GOAL_DEPTH]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}>
        <boxGeometry args={[0.2, 0.2, GOAL_DEPTH]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, GOAL_HEIGHT / 2, -GOAL_DEPTH]}>
        <boxGeometry args={[GOAL_WIDTH, GOAL_HEIGHT, 0.1]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>

      <mesh position={[-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}>
        <boxGeometry args={[0.1, GOAL_HEIGHT, GOAL_DEPTH]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>
      <mesh position={[GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}>
        <boxGeometry args={[0.1, GOAL_HEIGHT, GOAL_DEPTH]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>
    </group>
  );
};

export const Goal: React.FC = () => {
  return (
    <>
      <GoalNet position={[0, 0, -FIELD_LENGTH / 2]} />
      <group position={[0, 0, FIELD_LENGTH / 2]} rotation={[0, Math.PI, 0]}>
        <GoalNet position={[0, 0, 0]} />
      </group>
    </>
  );
};
