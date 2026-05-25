import { useMemo } from "react";
import * as THREE from "three";
import type { ObjectConfig } from "@/game/config";

interface Props {
  config: ObjectConfig;
  position: [number, number];
  locked?: boolean;
}

export function WorldObject({ config, position, locked }: Props) {
  const color = useMemo(() => new THREE.Color(config.color), [config.color]);
  const accent = useMemo(() => new THREE.Color(config.accent), [config.accent]);

  return (
    <group position={[position[0], 0, position[1]]}>
      {renderShape(config, color, accent)}
      {locked && (
        <mesh position={[0, config.height / 2 + 0.1, 0]}>
          <ringGeometry args={[
            config.radius * 1.2,
            config.radius * 1.5,
            24,
          ]} />
          <meshBasicMaterial
            color="#ff4d6d"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function renderShape(
  config: ObjectConfig,
  color: THREE.Color,
  accent: THREE.Color
) {
  const h = config.height;
  switch (config.kind) {
    case "flower":
      return (
        <group>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
            <meshStandardMaterial color="#155724" />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.22, 0.35, Math.sin(a) * 0.22]}
                castShadow
              >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color={color} />
              </mesh>
            );
          })}
        </group>
      );
    case "bush":
      return (
        <mesh position={[0, 0.45, 0]} castShadow>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color={color} flatShading roughness={1} />
        </mesh>
      );
    case "tree":
      return (
        <group>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 1.6, 8]} />
            <meshStandardMaterial color={accent} />
          </mesh>
          <mesh position={[0, 1.9, 0]} castShadow>
            <coneGeometry args={[0.8, 1.4, 10]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      );
    case "bigTree":
      return (
        <group>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.4, 3.2, 10]} />
            <meshStandardMaterial color={accent} />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <sphereGeometry args={[1.6, 14, 14]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0.9, 3.2, 0.3]} castShadow>
            <sphereGeometry args={[0.9, 12, 12]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      );
    case "pedestrian":
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color={accent} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.5, 0.08, 0.3]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      );
    case "trash":
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.42, 1.1, 14]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.12, 0]} castShadow>
            <torusGeometry args={[0.38, 0.06, 8, 20]} />
            <meshStandardMaterial color={accent} metalness={0.6} />
          </mesh>
        </group>
      );
    case "car":
      return (
        <group rotation={[0, Math.random() * Math.PI, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.8, 0.55, 0.9]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[1.0, 0.4, 0.85]} />
            <meshStandardMaterial color={accent} metalness={0.3} roughness={0.2} />
          </mesh>
          {[-0.7, 0.7].map((x) =>
            [-0.4, 0.4].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.22, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.2, 14]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            ))
          )}
        </group>
      );
    case "lamp":
      return (
        <group>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 5, 10]} />
            <meshStandardMaterial color={color} metalness={0.6} />
          </mesh>
          <mesh position={[0.7, 5.2, 0]} castShadow>
            <boxGeometry args={[1.4, 0.12, 0.12]} />
            <meshStandardMaterial color={color} metalness={0.6} />
          </mesh>
          <mesh position={[1.3, 5.1, 0]}>
            <sphereGeometry args={[0.28, 14, 14]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.5}
            />
          </mesh>
          <pointLight position={[1.3, 5, 0]} color="#ffd369" intensity={0.6} distance={10} />
        </group>
      );
    case "truck":
      return (
        <group rotation={[0, Math.random() * Math.PI, 0]}>
          <mesh position={[0.6, 0.7, 0]} castShadow>
            <boxGeometry args={[2.6, 1.2, 1.4]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[-1.1, 0.9, 0]} castShadow>
            <boxGeometry args={[0.9, 1.6, 1.3]} />
            <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} />
          </mesh>
          {[-0.6, 0.6].map((x) =>
            [-0.55, 0.55].map((z) => (
              <mesh key={`${x}-${z}`} position={[0.6 + x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.32, 0.32, 0.28, 16]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            ))
          )}
        </group>
      );
    case "house":
      return (
        <group>
          <mesh position={[0, 1.3, 0]} castShadow>
            <boxGeometry args={[3.2, 2.6, 2.8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.4, 1.2, 4]} />
            <meshStandardMaterial color={accent} />
          </mesh>
          <mesh position={[0, 0.9, 1.42]}>
            <boxGeometry args={[0.7, 1.4, 0.05]} />
            <meshStandardMaterial color="#3d2a1f" />
          </mesh>
          <mesh position={[1, 1.8, 1.42]}>
            <boxGeometry args={[0.6, 0.6, 0.05]} />
            <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={0.3} />
          </mesh>
        </group>
      );
    case "skyscraper":
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[3.6, h, 3.6]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0, 0.8 + i * (h / 10), 1.82]}>
              <boxGeometry args={[2.6, 0.25, 0.02]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
          <mesh position={[0, h + 0.5, 0]}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}
