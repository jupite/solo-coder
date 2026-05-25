import { useEffect, useRef } from "react";
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
  const funnel = useRef<THREE.Group>(null);
  const cloud = useRef<THREE.Mesh>(null);
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
    heading: 0,
  });

  useEffect(() => {
    state.current.x = 0;
    state.current.z = 0;
    state.current.vx = 0;
    state.current.vz = 0;
  }, [phase]);

  useFrame((_, delta) => {
    if (phase !== "playing") {
      if (funnel.current) {
        funnel.current.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh) {
            child.rotation.y += delta * (3 + i * 0.5);
          }
        });
      }
      if (cloud.current) cloud.current.rotation.y += delta * 0.8;
      return;
    }
    const s = state.current;
    const k = keys.current;
    const accel = 30;
    const maxSpeed = 10 + level * 1.2;
    const friction = 4;

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
      s.vx += dx * accel * delta;
      s.vz += dz * accel * delta;
      s.heading = Math.atan2(dx, dz);
    }

    const speed = Math.hypot(s.vx, s.vz);
    if (speed > maxSpeed) {
      s.vx = (s.vx / speed) * maxSpeed;
      s.vz = (s.vz / speed) * maxSpeed;
    }

    s.vx -= s.vx * friction * delta;
    s.vz -= s.vz * friction * delta;

    s.x += s.vx * delta;
    s.z += s.vz * delta;

    const mapLimit = 65;
    const d = Math.hypot(s.x, s.z);
    if (d > mapLimit) {
      s.x = (s.x / d) * mapLimit;
      s.z = (s.z / d) * mapLimit;
      s.vx *= -0.3;
      s.vz *= -0.3;
    }

    if (group.current) {
      group.current.position.x = s.x;
      group.current.position.z = s.z;
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        s.heading,
        0.15
      );
    }

    if (funnel.current) {
      const baseScale = 1 + (level - 1) * 0.25;
      funnel.current.scale.setScalar(baseScale);
      funnel.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += delta * (4 + i * 0.6);
        }
      });
    }
    if (cloud.current) {
      cloud.current.rotation.y += delta * 1.2;
      cloud.current.rotation.x += delta * 0.3;
    }

    const radius = tornadoRadius(level);
    if (worldRef.current) {
      worldRef.current.checkConsume(
        new THREE.Vector3(s.x, 0, s.z),
        radius * 1.15
      );
    }

    const camOffset = new THREE.Vector3(
      -Math.sin(s.heading) * (6 + level * 0.4),
      4.5 + level * 0.25,
      -Math.cos(s.heading) * (6 + level * 0.4)
    );
    const target = new THREE.Vector3(s.x, 0, s.z);
    const desired = target.clone().add(camOffset);
    camera.position.lerp(desired, 0.06);
    camera.lookAt(target.x, 1.5, target.z);

    setPlayer({ x: s.x, z: s.z });
  });

  const radius = tornadoRadius(level);
  const height = 3 + level * 0.6;

  return (
    <group ref={group} position={[0, 0, 0]}>
      <group ref={funnel}>
        <mesh position={[0, height * 0.1, 0]} castShadow>
          <cylinderGeometry
            args={[radius * 0.35, radius, height * 0.4, 24, 1, true]}
          />
          <meshStandardMaterial
            color="#b8c0ff"
            transparent
            opacity={0.65}
            emissive="#4cc9f0"
            emissiveIntensity={0.25}
            side={THREE.DoubleSide}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, height * 0.45, 0]} castShadow>
          <cylinderGeometry
            args={[radius * 0.15, radius * 0.5, height * 0.4, 20, 1, true]}
          />
          <meshStandardMaterial
            color="#e7ecff"
            transparent
            opacity={0.55}
            emissive="#8ecae6"
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, height * 0.75, 0]} castShadow>
          <cylinderGeometry
            args={[radius * 0.08, radius * 0.25, height * 0.3, 18, 1, true]}
          />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.9, radius * 1.4, 48]} />
        <meshBasicMaterial
          color="#4cc9f0"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={cloud} position={[0, height + 0.6, 0]}>
        <icosahedronGeometry args={[radius * 1.4, 1]} />
        <meshStandardMaterial
          color="#dce6ff"
          emissive="#4cc9f0"
          emissiveIntensity={0.35}
          flatShading
          roughness={0.9}
        />
      </mesh>
      <pointLight
        position={[0, height * 0.3, 0]}
        color="#8ecae6"
        intensity={1.5}
        distance={radius * 10}
      />
    </group>
  );
}
