import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, tornadoRadius } from "@/store/gameStore";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import type { WorldObjectsHandle } from "./WorldObjects";

interface TornadoProps {
  worldRef: React.MutableRefObject<WorldObjectsHandle | null>;
}

export function Tornado({ worldRef }: TornadoProps) {
  const group = useRef<THREE.Group>(null);
  const swirlRef = useRef<THREE.Group>(null);
  const funnelRef = useRef<THREE.Group>(null);
  const debrisRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const keys = useKeyboardControls();
  const setPlayer = useGameStore((s) => s.setPlayer);
  const phase = useGameStore((s) => s.phase);
  const level = useGameStore((s) => s.level);

  const state = useRef({
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
  });

  const radius = tornadoRadius(level);
  const height = 4.5 + level * 0.8;

  const ringLayers = useMemo(() => {
    const layers: { y: number; r: number; speed: number }[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      layers.push({
        y: height * (0.05 + t * 0.9),
        r: radius * (0.25 + Math.pow(t, 1.4) * 1.1),
        speed: 5 + t * 3,
      });
    }
    return layers;
  }, [radius, height]);

  const debrisLayers = useMemo(() => {
    const layers: { y: number; r: number; offset: number; speed: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      layers.push({
        y: height * (0.1 + t * 0.85),
        r: radius * (0.35 + Math.pow(t, 1.3) * 0.9),
        offset: Math.random() * Math.PI * 2,
        speed: 4 + t * 4,
      });
    }
    return layers;
  }, [radius, height]);

  useFrame((_, delta) => {
    const k = keys.current;
    const accel = 30;
    const maxSpeed = 10 + level * 1.2;
    const friction = 4;

    if (phase === "playing") {
      let dx = 0;
      let dz = 0;
      if (k.forward) dz -= 1;
      if (k.back) dz += 1;
      if (k.left) dx -= 1;
      if (k.right) dx += 1;

      const len = Math.hypot(dx, dz);
      if (len > 0) {
        dx /= len;
        dz /= len;
        state.current.vx += dx * accel * delta;
        state.current.vz += dz * accel * delta;
      }

      const speed = Math.hypot(state.current.vx, state.current.vz);
      if (speed > maxSpeed) {
        state.current.vx = (state.current.vx / speed) * maxSpeed;
        state.current.vz = (state.current.vz / speed) * maxSpeed;
      }

      state.current.vx -= state.current.vx * friction * delta;
      state.current.vz -= state.current.vz * friction * delta;

      state.current.x += state.current.vx * delta;
      state.current.z += state.current.vz * delta;

      const mapLimit = 65;
      const d = Math.hypot(state.current.x, state.current.z);
      if (d > mapLimit) {
        state.current.x = (state.current.x / d) * mapLimit;
        state.current.z = (state.current.z / d) * mapLimit;
        state.current.vx *= -0.3;
        state.current.vz *= -0.3;
      }

      if (worldRef.current) {
        worldRef.current.checkConsume(
          new THREE.Vector3(state.current.x, 0, state.current.z),
          radius * 1.15
        );
      }

      setPlayer({ x: state.current.x, z: state.current.z });
    }

    if (group.current) {
      group.current.position.x = state.current.x;
      group.current.position.z = state.current.z;
    }

    if (funnelRef.current) {
      funnelRef.current.rotation.y += delta * (phase === "playing" ? 4 : 2);
    }

    if (debrisRef.current) {
      debrisRef.current.rotation.y += delta * (phase === "playing" ? 3 : 1.5);
    }

    if (swirlRef.current) {
      const children = swirlRef.current.children;
      const now = performance.now() / 1000;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const layer = ringLayers[i];
        if (layer) {
          child.rotation.y = now * layer.speed;
        }
      }
    }

    const baseScale = 1 + (level - 1) * 0.25;
    if (funnelRef.current) {
      funnelRef.current.scale.setScalar(baseScale);
    }
    if (swirlRef.current) {
      swirlRef.current.scale.setScalar(baseScale);
    }
    if (debrisRef.current) {
      debrisRef.current.scale.setScalar(baseScale);
    }

    const camDist = 8 + level * 0.5;
    const camHeight = 5.5 + level * 0.3;
    const desired = new THREE.Vector3(
      state.current.x,
      camHeight,
      state.current.z + camDist
    );
    camera.position.lerp(desired, 0.08);
    camera.lookAt(state.current.x, 1.5, state.current.z);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.3, radius * 1.6, 48]} />
        <meshBasicMaterial
          color="#4cc9f0"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={funnelRef}>
        {ringLayers.map((layer, i) => {
          const tubeR = 0.05 + (1 - i / ringLayers.length) * 0.08;
          return (
            <mesh
              key={`ring-${i}`}
              position={[0, layer.y, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[layer.r, tubeR, 8, 48]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#e7ecff" : i % 3 === 1 ? "#4cc9f0" : "#8ecae6"}
                emissive={i % 3 === 0 ? "#8ecae6" : "#4cc9f0"}
                emissiveIntensity={0.4}
                transparent
                opacity={0.75}
              />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0, height * 0.5, 0]}>
        <coneGeometry args={[radius * 1.15, height, 32, 1, true]} />
        <meshStandardMaterial
          color="#b8c0ff"
          transparent
          opacity={0.25}
          emissive="#4cc9f0"
          emissiveIntensity={0.15}
          side={THREE.DoubleSide}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, height * 0.5, 0]}>
        <coneGeometry args={[radius * 0.85, height * 0.95, 28, 1, true]} />
        <meshStandardMaterial
          color="#d0d9ff"
          transparent
          opacity={0.2}
          emissive="#8ecae6"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={swirlRef}>
        {ringLayers.map((layer, i) => (
          <group key={`swirl-ring-${i}`} position={[0, layer.y, 0]}>
            <mesh
              position={[layer.r * 0.7, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[layer.r * 0.25, 0.04, 6, 16]} />
              <meshStandardMaterial
                color="#ffb547"
                emissive="#ffb547"
                emissiveIntensity={0.7}
              />
            </mesh>
          </group>
        ))}
      </group>

      <group ref={debrisRef}>
        {debrisLayers.map((layer, i) => (
          <group
            key={`debris-${i}`}
            position={[
              Math.cos(layer.offset) * layer.r * 0.55,
              layer.y,
              Math.sin(layer.offset) * layer.r * 0.55,
            ]}
          >
            <mesh rotation={[Math.PI / 4, Math.PI / 3, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#8ecae6" : "#ffb547"}
                emissive={i % 2 === 0 ? "#4cc9f0" : "#ffb547"}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>

      <mesh
        position={[0, height * 0.95, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.9, radius * 1.4, 32]} />
        <meshBasicMaterial
          color="#4cc9f0"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        position={[0, height * 0.5, 0]}
        color="#8ecae6"
        intensity={2.5}
        distance={radius * 14}
      />
    </group>
  );
}
