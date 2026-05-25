import React from 'react';
import * as THREE from 'three';
import {
  FIELD_LENGTH,
  FIELD_WIDTH,
  FIELD_COLOR,
  FIELD_LINE_COLOR,
  CENTER_CIRCLE_RADIUS,
  GOAL_WIDTH,
  GOAL_HEIGHT,
  PENALTY_AREA_LENGTH,
  PENALTY_AREA_WIDTH,
} from '../utils/constants';

const FieldLine: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
}> = ({ start, end }) => {
  const points = [start, end];
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])),
            3,
          ]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={FIELD_LINE_COLOR} linewidth={2} />
    </line>
  );
};

const CircleLine: React.FC<{
  center: THREE.Vector3;
  radius: number;
  segments?: number;
}> = ({ center, radius, segments = 64 }) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y,
        center.z + Math.sin(angle) * radius
      )
    );
  }

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])),
            3,
          ]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={FIELD_LINE_COLOR} linewidth={2} />
    </line>
  );
};

export const Field: React.FC = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[FIELD_WIDTH, FIELD_LENGTH]} />
        <meshStandardMaterial color={FIELD_COLOR} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[CENTER_CIRCLE_RADIUS - 0.1, CENTER_CIRCLE_RADIUS, 64]} />
        <meshBasicMaterial color={FIELD_LINE_COLOR} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color={FIELD_LINE_COLOR} />
      </mesh>

      <FieldLine
        start={new THREE.Vector3(-FIELD_WIDTH / 2, 0.05, 0)}
        end={new THREE.Vector3(FIELD_WIDTH / 2, 0.05, 0)}
      />

      <FieldLine
        start={new THREE.Vector3(-FIELD_WIDTH / 2, 0.05, -FIELD_LENGTH / 2)}
        end={new THREE.Vector3(FIELD_WIDTH / 2, 0.05, -FIELD_LENGTH / 2)}
      />
      <FieldLine
        start={new THREE.Vector3(-FIELD_WIDTH / 2, 0.05, FIELD_LENGTH / 2)}
        end={new THREE.Vector3(FIELD_WIDTH / 2, 0.05, FIELD_LENGTH / 2)}
      />
      <FieldLine
        start={new THREE.Vector3(-FIELD_WIDTH / 2, 0.05, -FIELD_LENGTH / 2)}
        end={new THREE.Vector3(-FIELD_WIDTH / 2, 0.05, FIELD_LENGTH / 2)}
      />
      <FieldLine
        start={new THREE.Vector3(FIELD_WIDTH / 2, 0.05, -FIELD_LENGTH / 2)}
        end={new THREE.Vector3(FIELD_WIDTH / 2, 0.05, FIELD_LENGTH / 2)}
      />

      <FieldLine
        start={new THREE.Vector3(-PENALTY_AREA_WIDTH / 2, 0.05, -FIELD_LENGTH / 2)}
        end={new THREE.Vector3(-PENALTY_AREA_WIDTH / 2, 0.05, -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH)}
      />
      <FieldLine
        start={new THREE.Vector3(PENALTY_AREA_WIDTH / 2, 0.05, -FIELD_LENGTH / 2)}
        end={new THREE.Vector3(PENALTY_AREA_WIDTH / 2, 0.05, -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH)}
      />
      <FieldLine
        start={new THREE.Vector3(-PENALTY_AREA_WIDTH / 2, 0.05, -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH)}
        end={new THREE.Vector3(PENALTY_AREA_WIDTH / 2, 0.05, -FIELD_LENGTH / 2 + PENALTY_AREA_LENGTH)}
      />

      <FieldLine
        start={new THREE.Vector3(-PENALTY_AREA_WIDTH / 2, 0.05, FIELD_LENGTH / 2)}
        end={new THREE.Vector3(-PENALTY_AREA_WIDTH / 2, 0.05, FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH)}
      />
      <FieldLine
        start={new THREE.Vector3(PENALTY_AREA_WIDTH / 2, 0.05, FIELD_LENGTH / 2)}
        end={new THREE.Vector3(PENALTY_AREA_WIDTH / 2, 0.05, FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH)}
      />
      <FieldLine
        start={new THREE.Vector3(-PENALTY_AREA_WIDTH / 2, 0.05, FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH)}
        end={new THREE.Vector3(PENALTY_AREA_WIDTH / 2, 0.05, FIELD_LENGTH / 2 - PENALTY_AREA_LENGTH)}
      />

      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={FIELD_LINE_COLOR} />
      </mesh>
    </group>
  );
};
