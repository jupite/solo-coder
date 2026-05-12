import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const containerRef = useRef(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const animationRef = useRef(null)
  const ufosRef = useRef([])
  const explosionsRef = useRef([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const baseSpeedRef = useRef(2)
  const scoreRef = useRef(0)
  const timeLeftRef = useRef(45)
  const gameOverRef = useRef(false)
  const gameStartedRef = useRef(false)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a20)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 15
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 200
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60
      positions[i + 1] = (Math.random() - 0.5) * 40
      positions[i + 2] = (Math.random() - 0.5) * 30
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    function createUFO(index) {
      const ufoGroup = new THREE.Group()

      const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        flatShading: false,
        emissive: 0x112244,
        emissiveIntensity: 0.5
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.scale.set(1, 0.6, 1)
      ufoGroup.add(body)

      const domeGeometry = new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)
      const domeMaterial = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        flatShading: false,
        transparent: true,
        opacity: 0.8,
        emissive: 0x224466,
        emissiveIntensity: 0.3
      })
      const dome = new THREE.Mesh(domeGeometry, domeMaterial)
      dome.position.y = 0.4
      ufoGroup.add(dome)

      const bottomGeometry = new THREE.CylinderGeometry(1.2, 0.8, 0.3, 16)
      const bottomMaterial = new THREE.MeshPhongMaterial({
        color: 0x555555,
        flatShading: false,
        emissive: 0x222222,
        emissiveIntensity: 0.3
      })
      const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial)
      bottom.position.y = -0.15
      ufoGroup.add(bottom)

      for (let i = 0; i < 8; i++) {
        const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8)
        const lightMaterial = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0xffff00 : 0xff00ff
        })
        const light = new THREE.Mesh(lightGeometry, lightMaterial)
        const angle = (i / 8) * Math.PI * 2
        light.position.set(
          Math.cos(angle) * 0.9,
          -0.2,
          Math.sin(angle) * 0.9
        )
        ufoGroup.add(light)
      }

      const startX = -12 - (index * 5) + Math.random() * 3
      const startY = (Math.random() - 0.5) * 8
      const startZ = (Math.random() - 0.5) * 4
      ufoGroup.position.set(startX, startY, startZ)

      ufoGroup.userData = {
        isUFO: true,
        speed: baseSpeedRef.current * (0.8 + Math.random() * 0.4),
        baseY: startY,
        phase: Math.random() * Math.PI * 2,
        active: true
      }

      return ufoGroup
    }

    function createExplosion(position) {
      const explosionGeometry = new THREE.SphereGeometry(0.1, 16, 16)
      const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 1
      })
      const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial)
      explosion.position.copy(position)
      explosion.userData = {
        maxRadius: 2,
        currentRadius: 0.1,
        speed: 0.15,
        opacity: 1
      }
      return explosion
    }

    const ufos = []
    for (let i = 0; i < 5; i++) {
      const ufo = createUFO(i)
      ufos.push(ufo)
      scene.add(ufo)
    }
    ufosRef.current = ufos

    function handleClick(event) {
      if (!gameStartedRef.current || gameOverRef.current) return

      const rect = renderer.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)

      let hitUFO = null
      for (const intersect of intersects) {
        let obj = intersect.object
        while (obj) {
          if (obj.userData.isUFO && obj.userData.active) {
            hitUFO = obj
            break
          }
          obj = obj.parent
        }
        if (hitUFO) break
      }

      if (hitUFO) {
        const explosion = createExplosion(hitUFO.position)
        explosionsRef.current.push(explosion)
        scene.add(explosion)

        hitUFO.visible = false
        hitUFO.userData.active = false

        const currentScore = scoreRef.current + 10
        setScore(currentScore)

        setTimeout(() => {
          hitUFO.position.x = -12 - Math.random() * 10
          hitUFO.position.y = (Math.random() - 0.5) * 8
          hitUFO.userData.baseY = hitUFO.position.y
          hitUFO.userData.phase = Math.random() * Math.PI * 2
          hitUFO.visible = true
          hitUFO.userData.active = true
        }, 500)
      }
    }

    function handleMouseMove(event) {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cursor = document.getElementById('crosshair')
      if (cursor) {
        cursor.style.left = `${event.clientX - rect.left}px`
        cursor.style.top = `${event.clientY - rect.top}px`
      }
    }

    renderer.domElement.addEventListener('click', handleClick)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    let lastTime = performance.now()

    function animate() {
      animationRef.current = requestAnimationFrame(animate)
      const currentTime = performance.now()
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      if (gameStartedRef.current && !gameOverRef.current) {
        const speedMultiplier = 1 + Math.floor(scoreRef.current / 100) * 0.5

        for (const ufo of ufosRef.current) {
          if (ufo.visible && ufo.userData.active) {
            ufo.position.x += ufo.userData.speed * speedMultiplier * delta * 60

            ufo.userData.phase += delta * 2
            ufo.position.y = ufo.userData.baseY + Math.sin(ufo.userData.phase) * 0.8

            ufo.rotation.y += delta * 0.5

            if (ufo.position.x > 15) {
              ufo.position.x = -12 - Math.random() * 5
              ufo.position.y = (Math.random() - 0.5) * 8
              ufo.userData.baseY = ufo.position.y
              ufo.userData.phase = Math.random() * Math.PI * 2
            }
          }
        }

        for (let i = explosionsRef.current.length - 1; i >= 0; i--) {
          const explosion = explosionsRef.current[i]
          explosion.userData.currentRadius += explosion.userData.speed * delta * 60
          explosion.userData.opacity -= 0.03 * delta * 60
          explosion.scale.setScalar(explosion.userData.currentRadius / 0.1)
          explosion.material.opacity = Math.max(0, explosion.userData.opacity)

          if (explosion.userData.opacity <= 0) {
            scene.remove(explosion)
            explosionsRef.current.splice(i, 1)
          }
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      renderer.domElement.removeEventListener('click', handleClick)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

  const startGame = () => {
    setScore(0)
    setTimeLeft(45)
    setGameOver(false)
    setGameStarted(true)
  }

  return (
    <div className="game-container" ref={containerRef}>
      <div id="crosshair" className="crosshair">
        <div className="crosshair-circle"></div>
        <div className="crosshair-line crosshair-h"></div>
        <div className="crosshair-line crosshair-v"></div>
      </div>

      {gameStarted && (
        <div className="hud">
          <div className="hud-item">
            <span className="hud-label">得分</span>
            <span className="hud-value">{score}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">时间</span>
            <span className="hud-value">{timeLeft}s</span>
          </div>
        </div>
      )}

      {!gameStarted && !gameOver && (
        <div className="overlay">
          <div className="modal">
            <h1>飞碟射击</h1>
            <p>点击飞碟进行射击，每击中一个得10分！</p>
            <p>速度随分数增加而提升，限时45秒！</p>
            <button onClick={startGame} className="start-button">
              开始游戏
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="overlay">
          <div className="modal">
            <h1>游戏结束</h1>
            <p className="final-score">最终得分: {score}</p>
            <button onClick={startGame} className="start-button">
              再玩一次
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
