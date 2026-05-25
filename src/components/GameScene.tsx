import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Tornado } from "./Tornado";
import { Terrain } from "./Terrain";
import {
  WorldObjects,
  type WorldObjectsHandle,
} from "./WorldObjects";
import { Particles } from "./Particles";

export function GameScene() {
  const worldRef = useRef<WorldObjectsHandle | null>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 7, 12], fov: 55, near: 0.1, far: 400 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color("#05070f"));
        scene.fog = new THREE.Fog("#0a1028", 40, 160);
      }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={["#0a1028"]} />
        <fog attach="fog" args={["#0a1028", 40, 160]} />

        <ambientLight intensity={0.45} color="#9cb4ff" />
        <hemisphereLight
          args={["#b8c0ff", "#1a2540", 0.6]}
        />
        <directionalLight
          position={[25, 40, 15]}
          intensity={1.1}
          color="#fff1cf"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
          shadow-camera-near={1}
          shadow-camera-far={120}
        />

        <Terrain />
        <Particles />
        <WorldObjects
          register={(handle) => {
            worldRef.current = handle;
          }}
        />
        <Tornado worldRef={worldRef} />
      </Suspense>
    </Canvas>
  );
}
