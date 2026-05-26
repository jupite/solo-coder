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
  const riderRef = useRef<THREE.Group>(null)
  const bowRef = useRef<THREE.Group>(null)

  const horsePosition = useGameStore((state) => state.horsePosition)
  const setHorsePosition = useGameStore((state) => state.setHorsePosition)
  const isPlaying = useGameStore((state) => state.isPlaying)
  const aimPosition = useGameStore((state) => state.aimPosition)
  const isCharging = useGameStore((state) => state.isCharging)
  const chargeProgress = useGameStore((state) => state.chargeProgress)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    if (isPlaying) {
      if (frontLeftLegRef.current) {
        frontLeftLegRef.current.rotation.x = Math.sin(time * 10) * 0.6
      }
      if (frontRightLegRef.current) {
        frontRightLegRef.current.rotation.x = Math.sin(time * 10 + Math.PI) * 0.6
      }
      if (backLeftLegRef.current) {
        backLeftLegRef.current.rotation.x = Math.sin(time * 10 + Math.PI) * 0.6
      }
      if (backRightLegRef.current) {
        backRightLegRef.current.rotation.x = Math.sin(time * 10) * 0.6
      }

      const bounceAmount = Math.abs(Math.sin(time * 10)) * 0.1
      const swayAmount = Math.sin(time * 5) * 0.05

      if (bodyRef.current) {
        bodyRef.current.position.y = 1.0 + bounceAmount
        bodyRef.current.rotation.z = swayAmount
      }

      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(time * 10) * 0.1
        headRef.current.rotation.z = Math.sin(time * 5) * 0.05
      }

      if (riderRef.current) {
        const bounceAmount = Math.abs(Math.sin(time * 10)) * 0.1
        const swayAmount = Math.sin(time * 5) * 0.05
        riderRef.current.position.y = 1.3 + bounceAmount
        riderRef.current.rotation.z = swayAmount * 0.3
        riderRef.current.rotation.x = Math.sin(time * 8) * 0.015

        if (bowRef.current) {
          const aimX = (aimPosition.x - 0.5) * Math.PI * 0.5
          const aimY = (aimPosition.y - 0.5) * Math.PI * 0.3
          bowRef.current.rotation.y = aimX
          bowRef.current.rotation.x = -aimY

          if (isCharging) {
            bowRef.current.scale.z = 1 + chargeProgress * 0.3
          } else {
            bowRef.current.scale.z = 1
          }
        }
      }

      const newPos = horsePosition + delta * 8
      setHorsePosition(newPos)
      groupRef.current.position.z = -newPos
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef} position={[0, 1.0, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.35, 1.8, 8, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.3, 1.6, 8, 16]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      </group>

      <group ref={headRef} position={[0, 1.4, -1.2]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.1, 0.08, 0.15]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[-0.1, 0.08, 0.15]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0, 0.2, 0.3]} castShadow rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.25, 8]} />
          <meshStandardMaterial color="#2F1810" />
        </mesh>
        <mesh position={[0, 0.35, -0.3]} castShadow rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <mesh ref={frontLeftLegRef} position={[0.22, 0.4, -0.7]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh ref={frontRightLegRef} position={[-0.22, 0.4, -0.7]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh ref={backLeftLegRef} position={[0.22, 0.4, 0.7]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh ref={backRightLegRef} position={[-0.22, 0.4, 0.7]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.9]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      <group ref={riderRef} position={[0, 1.3, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
          <meshStandardMaterial color="#2196F3" />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FFDBAC" />
        </mesh>
        <mesh position={[0, 0.58, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.1, 8]} />
          <meshStandardMaterial color="#795548" />
        </mesh>
        <mesh position={[0, 0.65, -0.03]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#2F1810" />
        </mesh>
        <mesh position={[0, 0.5, 0.08]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>

        <group ref={bowRef} position={[0.3, 0.15, -0.5]}>
          <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.35, 0.025, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
        </group>

        <mesh position={[-0.18, 0.1, -0.1]} rotation={[0.3, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#2196F3" />
        </mesh>
        <mesh position={[0.18, 0.1, -0.1]} rotation={[0.3, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#2196F3" />
        </mesh>
      </group>
    </group>
  )
}
