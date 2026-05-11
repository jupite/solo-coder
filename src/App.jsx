import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Physics, useSphere, useBox, usePlane } from '@react-three/cannon'
import './App.css'

function Ball({ position, onFall, onHitPaddle, resetBall }) {
  const [ref, api] = useSphere(() => ({
    mass: 0.027,
    position: position,
    args: [0.02],
    restitution: 0.85,
    friction: 0.1,
    linearDamping: 0.02,
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
    }
  }, [resetBall, api])

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.02, 32, 32]} />
      <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.3} />
    </mesh>
  )
}

function Paddle({ score }) {
  const [ref, api] = useBox(() => ({
    mass: 0,
    position: [0, 0.5, 0],
    args: [0.15, 0.01, 0.15],
    type: 'Kinematic',
    name: 'paddle'
  }))

  const currentY = useRef(0.5)
  const targetY = useRef(0.5)
  const isCharging = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        isCharging.current = true
        targetY.current = 0.3
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        isCharging.current = false
        targetY.current = 0.7
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    const prevY = currentY.current
    currentY.current += (targetY.current - currentY.current) * 0.2
    const velocity = (currentY.current - prevY) / delta

    api.position.set(0, currentY.current, 0)
    api.velocity.set(0, velocity, 0)
  })

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.01, 0.15]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      <mesh position={[0, -0.065, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.12, 16]} />
        <meshStandardMaterial color="#457b9d" />
      </mesh>
      <Html position={[0, 0.015, 0]} center>
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
    type: 'Static'
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1d3557" />
    </mesh>
  )
}

function CameraController() {
  return (
    <OrbitControls
      enableZoom={true}
      enablePan={false}
      minDistance={2}
      maxDistance={8}
      target={[0, 1, 0]}
      maxPolarAngle={Math.PI / 2 - 0.1}
    />
  )
}

function Scene({ score, setScore, gameOver, setGameOver }) {
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
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Physics
        gravity={[0, -9.8, 0]}
        defaultContactMaterial={{
          friction: 0.3,
          restitution: 0.8
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
        />
      </Physics>
    </>
  )
}

function App() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)

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
        <p className="instructions">按住空格键蓄力，释放球拍颠球！</p>
      </div>
      
      <div className="canvas-container">
        <Canvas
          key={gameKey}
          shadows
          camera={{ position: [3, 2, 3], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 10, 50]} />
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
            <button className="restart-btn" onClick={resetGame}>
              重新开始
            </button>
          </div>
        )}
      </div>
      
      <div className="controls">
        <h3>操作说明</h3>
        <ul>
          <li>🖱️ 鼠标拖动：旋转视角</li>
          <li>🖱️ 滚轮：缩放视图</li>
          <li>⌨️ 空格键：按住蓄力，释放颠球</li>
        </ul>
      </div>
    </div>
  )
}

export default App