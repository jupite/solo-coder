import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 260;

  useEffect(() => {
    if (!ref.current) return;
    const geom = ref.current.geometry as THREE.BufferGeometry;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 55;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.6, 0.6 + Math.random() * 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, []);

  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial
        size={0.35}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
