import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const containerRef = useRef(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const ballRef = useRef(null)
  const playerPaddleRef = useRef(null)
  const aiPaddleRef = useRef(null)
  const animationIdRef = useRef(null)
  const ballVelocityRef = useRef({ x: 0, y: 0, z: 0 })
  const playerPaddlePositionRef = useRef(0)
  const scoreRef = useRef({ player: 0, ai: 0 })
  const lastHitByRef = useRef(null)

  const TABLE_WIDTH = 6
  const TABLE_LENGTH = 12
  const PADDLE_WIDTH = 1.5
  const PADDLE_HEIGHT = 0.3
  const PADDLE_DEPTH = 0.2
  const BALL_RADIUS = 0.15
  const NET_HEIGHT = 0.1525
  const GRAVITY = 0.003
  const BOUNCE_FACTOR = 0.85
  const HORIZONTAL_DAMPING = 0.999
  const PLAYER_AREA_Z = -TABLE_LENGTH / 2
  const AI_AREA_Z = TABLE_LENGTH / 2

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 8, 10)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)

    const tableGeometry = new THREE.BoxGeometry(TABLE_WIDTH, 0.2, TABLE_LENGTH)
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2e7d32,
      roughness: 0.7
    })
    const table = new THREE.Mesh(tableGeometry, tableMaterial)
    table.position.y = -0.1
    table.receiveShadow = true
    scene.add(table)

    const lineGeometry = new THREE.BoxGeometry(0.02, 0.05, TABLE_LENGTH)
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial)
    centerLine.position.set(0, 0.05, 0)
    scene.add(centerLine)

    const netPostGeometry = new THREE.CylinderGeometry(0.03, 0.03, NET_HEIGHT, 8)
    const netPostMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const leftNetPost = new THREE.Mesh(netPostGeometry, netPostMaterial)
    leftNetPost.position.set(-TABLE_WIDTH / 2, NET_HEIGHT / 2, 0)
    leftNetPost.castShadow = true
    scene.add(leftNetPost)

    const rightNetPost = new THREE.Mesh(netPostGeometry, netPostMaterial)
    rightNetPost.position.set(TABLE_WIDTH / 2, NET_HEIGHT / 2, 0)
    rightNetPost.castShadow = true
    scene.add(rightNetPost)

    const netGeometry = new THREE.PlaneGeometry(TABLE_WIDTH, NET_HEIGHT)
    const netMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    })
    const net = new THREE.Mesh(netGeometry, netMaterial)
    net.rotation.x = -Math.PI / 2
    net.rotation.y = Math.PI / 2
    net.position.set(0, NET_HEIGHT / 2, 0)
    scene.add(net)

    const paddleGeometry = new THREE.BoxGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH)
    const playerPaddleMaterial = new THREE.MeshStandardMaterial({ color: 0x1976d2 })
    const playerPaddle = new THREE.Mesh(paddleGeometry, playerPaddleMaterial)
    playerPaddle.position.set(0, 0.15, -TABLE_LENGTH / 2 + 1)
    playerPaddle.castShadow = true
    scene.add(playerPaddle)
    playerPaddleRef.current = playerPaddle

    const aiPaddleMaterial = new THREE.MeshStandardMaterial({ color: 0xd32f2f })
    const aiPaddle = new THREE.Mesh(paddleGeometry, aiPaddleMaterial)
    aiPaddle.position.set(0, 0.15, TABLE_LENGTH / 2 - 1)
    aiPaddle.castShadow = true
    scene.add(aiPaddle)
    aiPaddleRef.current = aiPaddle

    const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32)
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const ball = new THREE.Mesh(ballGeometry, ballMaterial)
    ball.position.set(0, 0.2, 0)
    ball.castShadow = true
    scene.add(ball)
    ballRef.current = ball

    const handleMouseMove = (event) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      playerPaddlePositionRef.current = mouseX * (TABLE_WIDTH / 2 - PADDLE_WIDTH / 2)
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    const checkPaddleCollision = (paddle, isPlayer) => {
      if (!ballRef.current) return false
      
      const ballPos = ballRef.current.position
      const paddlePos = paddle.position
      
      const dx = Math.abs(ballPos.x - paddlePos.x)
      const dz = Math.abs(ballPos.z - paddlePos.z)
      const dy = ballPos.y - paddlePos.y
      
      if (dx < PADDLE_WIDTH / 2 + BALL_RADIUS && 
          dz < PADDLE_DEPTH / 2 + BALL_RADIUS &&
          dy > 0 && dy < PADDLE_HEIGHT + BALL_RADIUS) {
        
        const hitX = ballPos.x - paddlePos.x
        const hitY = ballPos.y - paddlePos.y
        const normX = hitX / (PADDLE_WIDTH / 2)
        const normY = hitY / PADDLE_HEIGHT
        
        const baseSpeed = 0.2
        const verticalBoost = 0.15
        
        ballVelocityRef.current.x = normX * baseSpeed * 0.8
        ballVelocityRef.current.y = Math.max(normY * verticalBoost + 0.1, 0.12)
        ballVelocityRef.current.z = isPlayer ? baseSpeed : -baseSpeed
        
        ballRef.current.position.z = paddlePos.z + (isPlayer ? PADDLE_DEPTH / 2 + BALL_RADIUS + 0.01 : -PADDLE_DEPTH / 2 - BALL_RADIUS - 0.01)
        
        lastHitByRef.current = isPlayer ? 'player' : 'ai'
        
        return true
      }
      
      return false
    }

    const checkNetCollision = () => {
      if (!ballRef.current) return false
      
      const ballPos = ballRef.current.position
      const vel = ballVelocityRef.current
      
      if (Math.abs(ballPos.z) < BALL_RADIUS + 0.025 && 
          Math.abs(ballPos.x) < TABLE_WIDTH / 2 &&
          ballPos.y < NET_HEIGHT + BALL_RADIUS) {
        
        if (vel.z > 0) {
          ballRef.current.position.z = -BALL_RADIUS - 0.025
        } else {
          ballRef.current.position.z = BALL_RADIUS + 0.025
        }
        
        vel.z = -vel.z * 0.5
        vel.x *= 0.8
        vel.y *= 0.5
        
        return true
      }
      
      return false
    }

    const checkTableBounce = () => {
      if (!ballRef.current) return
      
      const ballPos = ballRef.current.position
      const vel = ballVelocityRef.current
      
      if (vel.y < 0 && ballPos.y <= BALL_RADIUS) {
        if (Math.abs(ballPos.x) < TABLE_WIDTH / 2 && Math.abs(ballPos.z) < TABLE_LENGTH / 2) {
          ballPos.y = BALL_RADIUS
          vel.y = -vel.y * BOUNCE_FACTOR
          vel.x *= HORIZONTAL_DAMPING
          vel.z *= HORIZONTAL_DAMPING
        }
      }
    }

    const checkOutOfBounds = () => {
      if (!ballRef.current) return false
      
      const ballPos = ballRef.current.position
      
      if (ballPos.y < -1 || 
          Math.abs(ballPos.x) > TABLE_WIDTH / 2 + 2 || 
          Math.abs(ballPos.z) > TABLE_LENGTH / 2 + 2) {
        return true
      }
      
      return false
    }

    const getLastSide = () => {
      if (!ballRef.current) return null
      if (ballRef.current.position.z < 0) return 'player'
      if (ballRef.current.position.z > 0) return 'ai'
      return null
    }

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

      if (playerPaddleRef.current) {
        playerPaddleRef.current.position.x = THREE.MathUtils.lerp(
          playerPaddleRef.current.position.x,
          playerPaddlePositionRef.current,
          0.2
        )
      }

      if (gameStarted && ballRef.current && aiPaddleRef.current) {
        const vel = ballVelocityRef.current
        const ballPos = ballRef.current.position
        
        vel.y -= GRAVITY
        ballPos.x += vel.x
        ballPos.y += vel.y
        ballPos.z += vel.z
        
        if (ballPos.x > TABLE_WIDTH / 2 - BALL_RADIUS) {
          ballPos.x = TABLE_WIDTH / 2 - BALL_RADIUS
          vel.x = -vel.x * 0.8
        }
        if (ballPos.x < -TABLE_WIDTH / 2 + BALL_RADIUS) {
          ballPos.x = -TABLE_WIDTH / 2 + BALL_RADIUS
          vel.x = -vel.x * 0.8
        }
        
        checkTableBounce()
        checkNetCollision()
        
        if (playerPaddleRef.current && vel.z < 0) {
          checkPaddleCollision(playerPaddleRef.current, true)
        }
        if (aiPaddleRef.current && vel.z > 0) {
          checkPaddleCollision(aiPaddleRef.current, false)
        }
        
        if (checkOutOfBounds()) {
          const lastSide = getLastSide()
          if (lastSide === 'player') {
            scoreRef.current.ai += 1
            setAiScore(scoreRef.current.ai)
          } else {
            scoreRef.current.player += 1
            setPlayerScore(scoreRef.current.player)
          }
          resetBall()
        }
        
        if (aiPaddleRef.current) {
          const currentZ = aiPaddleRef.current.position.z
          let targetX = ballPos.x
          
          if (ballPos.z < 0 || Math.abs(vel.z) < 0.05) {
            targetX = 0
          }
          
          aiPaddleRef.current.position.x = THREE.MathUtils.lerp(
            aiPaddleRef.current.position.x,
            targetX,
            0.03
          )
          
          aiPaddleRef.current.position.x = Math.max(
            -TABLE_WIDTH / 2 + PADDLE_WIDTH / 2,
            Math.min(TABLE_WIDTH / 2 - PADDLE_WIDTH / 2, aiPaddleRef.current.position.x)
          )
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }

    const resetBall = () => {
      if (!ballRef.current) return
      ballRef.current.position.set(0, 0.5, 0)
      const direction = Math.random() > 0.5 ? 1 : -1
      const angle = (Math.random() - 0.5) * Math.PI / 4
      ballVelocityRef.current = {
        x: Math.sin(angle) * 0.1,
        y: 0.15,
        z: direction * 0.12
      }
      lastHitByRef.current = null
    }

    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove)
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      window.removeEventListener('resize', handleResize)
      rendererRef.current?.dispose()
    }
  }, [gameStarted])

  const startGame = () => {
    scoreRef.current = { player: 0, ai: 0 }
    setPlayerScore(0)
    setAiScore(0)
    setGameStarted(true)
    if (ballRef.current) {
      ballRef.current.position.set(0, 0.5, 0)
      const direction = Math.random() > 0.5 ? 1 : -1
      const angle = (Math.random() - 0.5) * Math.PI / 4
      ballVelocityRef.current = {
        x: Math.sin(angle) * 0.1,
        y: 0.15,
        z: direction * 0.12
      }
    }
  }

  return (
    <div className="app">
      <div className="scoreboard">
        <div className="score player">
          <div className="score-label">玩家</div>
          <div className="score-value">{playerScore}</div>
        </div>
        <div className="score-divider">VS</div>
        <div className="score ai">
          <div className="score-label">AI</div>
          <div className="score-value">{aiScore}</div>
        </div>
      </div>
      
      {!gameStarted && (
        <div className="start-screen">
          <h1>乒乓球对打游戏</h1>
          <p>使用鼠标左右移动控制球拍</p>
          <p>球会在球台上弹跳，用球拍击球</p>
          <button onClick={startGame} className="start-button">
            开始游戏
          </button>
        </div>
      )}

      <div ref={containerRef} className="game-container"></div>
    </div>
  )
}

export default App
