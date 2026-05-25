import { MAP_RADIUS } from "@/game/config";

export function Terrain() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[MAP_RADIUS + 10, 96]} />
        <meshStandardMaterial color="#1a2540" roughness={1} metalness={0} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[8, 34, 64]} />
        <meshStandardMaterial color="#2b3352" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#3a3f55" roughness={0.8} />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 12;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.03, Math.sin(a) * r]}
            rotation={[-Math.PI / 2, 0, a]}
            receiveShadow
          >
            <planeGeometry args={[4, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#e0aaff" : "#4cc9f0"}
              emissive={i % 2 === 0 ? "#e0aaff" : "#4cc9f0"}
              emissiveIntensity={0.3}
              transparent
              opacity={0.25}
            />
          </mesh>
        );
      })}

      {Array.from({ length: 24 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 30;
        return (
          <mesh
            key={`dot-${i}`}
            position={[Math.cos(a) * r, 0.04, Math.sin(a) * r]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.25 + Math.random() * 0.3, 12]} />
            <meshBasicMaterial color="#6d5dfc" transparent opacity={0.5} />
          </mesh>
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[MAP_RADIUS, MAP_RADIUS + 0.6, 96]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
