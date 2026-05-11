import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Physics, useSphere, useBox, usePlane } from '@react-three/cannon'
import * as THREE from 'three'
import './App.css'

function Ball({ position, onFall, onHitPaddle, resetBall }) {
  const [ref, api] = useSphere(() => ({
    mass: 0.027,
    position: position,
    args: [0.02],
    restitution: 0.9,
    friction: 0.05,
    linearDamping: 0.01,
    angularDamping: 0.01,
    onCollide: (e) => {
      if (e.body.name === 'paddle') {
        const impactVelocity = e.contact.impactVelocity
        if (impactVelocity > 0.1) {
          onHitPaddle(impactVelocity)
        }
      }
    }
  }))

  useFrame(() => {
    api.position.subscribe((pos) => {
      if (pos[1] < -3) {
        onFall()
      }
    })
  })

  useEffect(() => {
    if (resetBall) {
      api.position.set(0, 2, 0)
      api.velocity.set(0, 0, 0)
      api.angularVelocity.set(0, 0, 0)
    }
  }, [resetBall, api])

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.02, 32, 32]} />
      <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.3} />
    </mesh>
  )
}

function Paddle({ score, paddleState }) {
  const [ref, api] = useBox(() => ({
    mass: 10,
    position: [0, 0.5, 0],
    args: [0.2, 0.008, 0.2],
    type: 'Kinematic',
    name: 'paddle',
    material: 'paddle'
  }))

  const currentPos = useRef([0, 0.5, 0])
  const targetPos = useRef([0, 0.5, 0])
  const velocity = useRef([0, 0, 0])
  const isCharging = useRef(false)

  useEffect(() => {
    paddleState.current = {
      getPosition: () => currentPos.current,
      getVelocity: () => velocity.current
    }
  }, [paddleState])

  useFrame((state, delta) => {
    if (delta > 0.1) delta = 0.1

    const mouse = state.pointer
    const canvas = state.gl.domElement
    const rect = canvas.getBoundingClientRect()

    const targetX = (mouse.x * rect.width / 2) * 0.005
    const targetZ = (mouse.y * rect.height / 2) * 0.003

    let targetY = 0.5
    if (isCharging.current) {
      targetY = 0.3
    }

    targetPos.current = [targetX, targetY, targetZ]

    const prevPos = [...currentPos.current]
    const smoothing = 0.15

    currentPos.current[0] += (targetPos.current[0] - currentPos.current[0]) * smoothing
    currentPos.current[1] += (targetPos.current[1] - currentPos.current[1]) * smoothing
    currentPos.current[2] += (targetPos.current[2] - currentPos.current[2]) * smoothing

    velocity.current = [
      (currentPos.current[0] - prevPos[0]) / delta,
      (currentPos.current[1] - prevPos[1]) / delta,
      (currentPos.current[2] - prevPos[2]) / delta
    ]

    api.position.set(...currentPos.current)
    api.velocity.set(...velocity.current)
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        isCharging.current = true
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        isCharging.current = false
        setTimeout(() => {
          targetPos.current[1] = 0.7
        }, 50)
        setTimeout(() => {
          targetPos.current[1] = 0.5
        }, 150)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.008, 0.2]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      <mesh castShadow position={[-0.12, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.08, 0.015, 0.025]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.01, 0.15, 16]} />
        <meshStandardMaterial color="#457b9d" />
      </mesh>
      <Html position={[0, 0.01, 0]} center>
        <div className="score-display">
          {score}
        </div>
      </Html>
    </group>
  )
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -5, 0],
    type: 'Static',
    material: 'ground'
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1d3557" />
    </mesh>
  )
}

function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 1.5, 3)
    camera.lookAt(0, 1, 0)
  }, [camera])

  return (
    <OrbitControls
      enableZoom={true}
      enablePan={false}
      enableRotate={true}
      minDistance={1.5}
      maxDistance={8}
      target={[0, 1, 0]}
      maxPolarAngle={Math.PI / 2 - 0.1}
      minPolarAngle={Math.PI / 6}
    />
  )
}

function Scene({ score, setScore, gameOver, setGameOver, paddleState }) {
  const initialBallPosition = [0, 2, 0]

  const handleFall = useCallback(() => {
    if (!gameOver) {
      setGameOver(true)
    }
  }, [gameOver, setGameOver])

  const handleHitPaddle = useCallback(() => {
    if (!gameOver) {
      setScore(prev => prev + 1)
    }
  }, [gameOver, setScore])

  return (
    <>
      <CameraController />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[3, 8, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Physics
        gravity={[0, -9.8, 0]}
        defaultContactMaterial={{
          friction: 0.1,
          restitution: 0.9
        }}
      >
        <Ground />
        <Ball
          position={initialBallPosition}
          onFall={handleFall}
          onHitPaddle={handleHitPaddle}
          resetBall={!gameOver}
        />
        <Paddle
          score={score}
          paddleState={paddleState}
        />
      </Physics>
    </>
  )
}

function App() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const paddleState = useRef(null)

  const resetGame = () => {
    setScore(0)
    setGameOver(false)
    setGameKey(prev => prev + 1)
  }

  useEffect(() => {
    if (gameOver) {
      setScore(0)
    }
  }, [gameOver])

  return (
    <div className="app-container">
      <div className="game-header">
        <h1>🏓 乒乓球颠球游戏</h1>
        <p className="instructions">鼠标移动控制球拍位置，空格键蓄力颠球！</p>
      </div>
      
      <div className="canvas-container">
        <Canvas
          key={gameKey}
          shadows
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 10, 50]} />
          <Scene
            score={score}
            setScore={setScore}
            gameOver={gameOver}
            setGameOver={setGameOver}
            paddleState={paddleState}
          />
        </Canvas>
      </div>
      
      <div className="score-panel">
        <div className="current-score">
          <span>连续颠球:</span>
          <span className="score-value">{score}</span>
        </div>
        
        {gameOver && (
          <div className="game-over">
            <h2>游戏结束！</h2>
            <button className="restart-btn" onClick={resetGame}>
              重新开始
            </button>
          </div>
        )}
      </div>
      
      <div className="controls">
        <h3>操作说明</h3>
        <ul>
          <li>🖱️ 鼠标移动：控制球拍水平位置</li>
          <li>🖱️ 鼠标拖动：旋转视角</li>
          <li>🖱️ 滚轮：缩放视图</li>
          <li>⌨️ 空格键：按住蓄力，释放颠球</li>
        </ul>
      </div>
    </div>
  )
}

export default App