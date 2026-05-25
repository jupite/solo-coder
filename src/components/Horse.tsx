import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export function Horse() {
  const groupRef = useRef<THREE.Group>(null)
  const frontLeftLegRef = useRef<THREE.Mesh>(null)
  const frontRightLegRef = useRef<THREE.Mesh>(null)
  const backLeftLegRef = useRef<THREE.Mesh>(null)
  const backRightLegRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)

  const horsePosition = useGameStore((state) => state.horsePosition)
  const setHorsePosition = useGameStore((state) => state.setHorsePosition)
  const isPlaying = useGameStore((state) => state.isPlaying)

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return

    const time = state.clock.elapsedTime

    if (frontLeftLegRef.current) {
      frontLeftLegRef.current.rotation.x = Math.sin(time * 12) * 0.6
    }
    if (frontRightLegRef.current) {
      frontRightLegRef.current.rotation.x = Math.sin(time * 12 + Math.PI) * 0.6
    }
    if (backLeftLegRef.current) {
      backLeftLegRef.current.rotation.x = Math.sin(time * 12 + Math.PI) * 0.6
    }
    if (backRightLegRef.current) {
      backRightLegRef.current.rotation.x = Math.sin(time * 12) * 0.6
    }

    if (bodyRef.current) {
      bodyRef.current.position.y = 1.2 + Math.abs(Math.sin(time * 12)) * 0.1
      bodyRef.current.position.x = Math.sin(time * 6) * 0.05
    }

    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 12) * 0.1
      headRef.current.rotation.z = Math.sin(time * 6) * 0.05
    }

    const newPos = horsePosition + delta * 8
    setHorsePosition(newPos)
    groupRef.current.position.z = -newPos
    groupRef.current.position.y = Math.sin(time * 4) * 0.05
    groupRef.current.rotation.x = Math.sin(time * 8) * 0.02
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.8, 8, 16]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      </group>

      <group ref={headRef} position={[0, 1.8, 0.8]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.12, 0.15, 0.15]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[-0.12, 0.15, 0.15]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0, 0.3, -0.1]} castShadow>
          <coneGeometry args={[0.15, 0.3, 8]} />
          <meshStandardMaterial color="#2F1810" />
        </mesh>
      </group>

      <mesh ref={frontLeftLegRef} position={[0.2, 0.5, 0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh ref={frontRightLegRef} position={[-0.2, 0.5, 0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh ref={backLeftLegRef} position={[0.2, 0.5, -0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh ref={backRightLegRef} position={[-0.2, 0.5, -0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.7]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      <group position={[0, 1.7, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
          <meshStandardMaterial color="#FFDBAC" />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#FFDBAC" />
        </mesh>
        <mesh position={[0, 0.5, 0.1]} castShadow>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshStandardMaterial color="#FFDBAC" />
        </mesh>
      </group>
    </group>
  )
}
