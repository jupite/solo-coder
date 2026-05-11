import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Physics, useSphere, useBox } from '@react-three/cannon'
import './App.css'

function Ball({ initialPos, onFall, onHitPaddle, shouldReset }) {
  const [ref, api] = useSphere(() => ({
    mass: 0.027,
    position: initialPos,
    args: [0.03],
    restitution: 0.92,
    friction: 0.02,
    linearDamping: 0.005,
    angularDamping: 0.01,
    onCollide: (e) => {
      if (e.body && e.body.name === 'paddle') {
        onHitPaddle()
      }
    }
  }))

  useFrame(() => {
    api.position.subscribe((pos) => {
      if (pos[1] < -0.5) {
        onFall()
      }
    })
  })

  useEffect(() => {
    if (shouldReset) {
      api.position.set(initialPos[0], initialPos[1], initialPos[2])
      api.velocity.set(0, 0, 0)
      api.angularVelocity.set(0, 0, 0)
    }
  }, [shouldReset, api, initialPos])

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.03, 32, 32]} />
      <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.4} />
    </mesh>
  )
}

function Paddle({ score, onPaddleMove }) {
  const [ref, api] = useBox(() => ({
    mass: 0,
    position: [0, 0.3, 0],
    args: [0.25, 0.01, 0.25],
    type: 'Kinematic',
    name: 'paddle',
    restitution: 0.95,
    friction: 0.01
  }))

  const currentPos = useRef([0, 0.3, 0])
  const targetPos = useRef([0, 0.3, 0])
  const velocity = useRef([0, 0, 0])
  const isCharging = useRef(false)
  const isSwinging = useRef(false)

  useEffect(() => {
    onPaddleMove.current = (newPos) => {
      targetPos.current[0] = newPos[0]
      targetPos.current[2] = newPos[2]
    }
  }, [onPaddleMove])

  useFrame((state, delta) => {
    if (delta > 0.1) delta = 0.1

    let targetY = 0.3
    if (isSwinging.current) {
      targetY = 0.8
    } else if (isCharging.current) {
      targetY = 0.15
    }

    targetPos.current[1] = targetY

    const prevPos = [...currentPos.current]
    const smoothing = 0.2

    currentPos.current[0] += (targetPos.current[0] - currentPos.current[0]) * smoothing
    currentPos.current[1] += (targetPos.current[1] - currentPos.current[1]) * smoothing * 0.3
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
        if (!isCharging.current && !isSwinging.current) {
          isCharging.current = true
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        if (isCharging.current) {
          isCharging.current = false
          isSwinging.current = true
          
          setTimeout(() => {
            isSwinging.current = false
          }, 200)
        }
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
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.25, 0.01, 0.25]} />
        <meshStandardMaterial color="#e63946" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.16]}>
        <cylinderGeometry args={[0.015, 0.012, 0.18, 16]} />
        <meshStandardMaterial color="#457b9d" roughness={0.5} />
      </mesh>
      <Html position={[0, 0.015, 0]} center>
        <div className="score-display">
          {score}
        </div>
      </Html>
    </group>
  )
}

function Table() {
  return (
    <mesh position={[0, -0.1, 0]} receiveShadow>
      <boxGeometry args={[3, 0.02, 2]} />
      <meshStandardMaterial color="#1e3a5f" roughness={0.8} />
    </mesh>
  )
}

function Hand() {
  return (
    <group position={[0, 0.05, -0.35]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.05, 0.06]} />
        <meshStandardMaterial color="#f5d7c3" roughness={0.7} />
      </mesh>
      <mesh position={[0.03, 0.03, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.03, 0.015, 0.012]} />
        <meshStandardMaterial color="#f5d7c3" roughness={0.7} />
      </mesh>
      <mesh position={[0.01, 0.01, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.03, 0.015, 0.012]} />
        <meshStandardMaterial color="#f5d7c3" roughness={0.7} />
      </mesh>
      <mesh position={[-0.01, -0.01, 0]}>
        <boxGeometry args={[0.03, 0.015, 0.012]} />
        <meshStandardMaterial color="#f5d7c3" roughness={0.7} />
      </mesh>
      <mesh position={[-0.03, -0.03, 0]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.03, 0.015, 0.012]} />
        <meshStandardMaterial color="#f5d7c3" roughness={0.7} />
      </mesh>
    </group>
  )
}

function FixedCamera() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 1.5, 3)
    camera.lookAt(0, 0.5, 0)
  }, [camera])

  return null
}

function MouseController({ onPaddleMove }) {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      const moveX = x * 1.0
      const moveZ = -y * 0.6

      onPaddleMove.current([moveX, 0, moveZ])
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [onPaddleMove])

  return null
}

function Scene({ score, setScore, gameOver, setGameOver }) {
  const onPaddleMove = useRef(() => {})
  const initialBallPosition = [0, 1.5, 0]

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
      <FixedCamera />
      <MouseController onPaddleMove={onPaddleMove} />
      
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[2, 6, 3]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight position={[-3, 3, 2]} intensity={0.5} color="#87ceeb" />
      
      <Physics
        gravity={[0, -9.8, 0]}
        defaultContactMaterial={{
          friction: 0.05,
          restitution: 0.9
        }}
        allowSleep={false}
      >
        <Ball
          initialPos={initialBallPosition}
          onFall={handleFall}
          onHitPaddle={handleHitPaddle}
          shouldReset={!gameOver}
        />
        <Paddle
          score={score}
          onPaddleMove={onPaddleMove}
        />
      </Physics>
      
      <Table />
      <Hand />
    </>
  )
}

function App() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)

  const resetGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    setGameKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && gameOver) {
        e.preventDefault()
        resetGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, resetGame])

  useEffect(() => {
    if (gameOver) {
      setScore(0)
    }
  }, [gameOver])

  return (
    <div className="app-container">
      <div className="game-header">
        <h1>🏓 乒乓球颠球游戏</h1>
        <p className="instructions">鼠标移动控制球拍，空格键蓄力颠球！</p>
      </div>
      
      <div className="canvas-container">
        <Canvas
          key={gameKey}
          shadows
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#1a1a2e']} />
          <fog attach="fog" args={['#1a1a2e', 5, 15]} />
          <Scene
            score={score}
            setScore={setScore}
            gameOver={gameOver}
            setGameOver={setGameOver}
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
            <p className="restart-hint">按空格键重新开始</p>
            <button className="restart-btn" onClick={resetGame}>
              重新开始
            </button>
          </div>
        )}
      </div>
      
      <div className="controls">
        <h3>操作说明</h3>
        <ul>
          <li>🖱️ 鼠标移动：控制球拍位置</li>
          <li>🖱️ 滚轮：缩放视图</li>
          <li>⌨️ 空格键：按住蓄力，释放颠球</li>
        </ul>
      </div>
    </div>
  )
}

export default App