import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import './App.css'

const BOARD_SIZE = 15
const CELL_SIZE = 1
const BOARD_PADDING = 0.5
const TOTAL_SIZE = (BOARD_SIZE - 1) * CELL_SIZE + BOARD_PADDING * 2

function createWoodTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  const baseColor = '#8B4513'
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * canvas.height
    const height = Math.random() * 2 + 1
    const opacity = Math.random() * 0.3
    ctx.fillStyle = `rgba(139, 69, 19, ${opacity})`
    ctx.fillRect(0, y, canvas.width, height)
  }
  
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() * 30 + 10
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.1)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }
  
  for (let i = 0; i < 50; i++) {
    const y = Math.random() * canvas.height
    const x = Math.random() * canvas.width
    const length = Math.random() * 100 + 50
    const angle = Math.random() * 0.2 - 0.1
    ctx.strokeStyle = `rgba(101, 67, 33, ${Math.random() * 0.2})`
    ctx.lineWidth = Math.random() * 2 + 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

function App() {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const piecesRef = useRef([])
  const intersectionPointsRef = useRef([])
  const hoverPointRef = useRef(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  
  const [board, setBoard] = useState(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState('black')
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState('黑棋先行')

  const checkWin = useCallback((board, row, col, player) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ]
    
    for (const [dx, dy] of directions) {
      let count = 1
      
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (newRow >= 0 && newRow < BOARD_SIZE && 
            newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (newRow >= 0 && newRow < BOARD_SIZE && 
            newCol >= 0 && newCol < BOARD_SIZE && 
            board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      if (count >= 5) return true
    }
    
    return false
  }, [])

  const placePiece = useCallback((row, col) => {
    if (winner) return
    if (board[row][col]) return
    
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentPlayer
    setBoard(newBoard)
    
    if (checkWin(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer)
      setMessage(currentPlayer === 'black' ? '黑棋获胜！' : '白棋获胜！')
    } else {
      const nextPlayer = currentPlayer === 'black' ? 'white' : 'black'
      setCurrentPlayer(nextPlayer)
      setMessage(nextPlayer === 'black' ? '轮到黑棋' : '轮到白棋')
    }
  }, [board, currentPlayer, winner, checkWin])

  const createPiece = useCallback((scene, row, col, player) => {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: player === 'black' ? 0x1a1a1a : 0xf0f0f0,
      shininess: 80,
      specular: player === 'black' ? 0x222222 : 0xaaaaaa
    })
    const piece = new THREE.Mesh(geometry, material)
    
    const x = col * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
    const z = row * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
    piece.position.set(x, 0.45, z)
    
    piece.userData = { row, col, player }
    scene.add(piece)
    
    if (!piecesRef.current[row]) {
      piecesRef.current[row] = []
    }
    piecesRef.current[row][col] = piece
    
    return piece
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 12, 10)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera
    
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -15
    directionalLight.shadow.camera.right = 15
    directionalLight.shadow.camera.top = 15
    directionalLight.shadow.camera.bottom = -15
    scene.add(directionalLight)
    
    const boardGeometry = new THREE.BoxGeometry(TOTAL_SIZE, 0.3, TOTAL_SIZE)
    const woodTexture = createWoodTexture()
    const boardMaterial = new THREE.MeshPhongMaterial({
      map: woodTexture,
      side: THREE.DoubleSide
    })
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial)
    boardMesh.receiveShadow = true
    boardMesh.position.y = -0.15
    scene.add(boardMesh)
    
    const linesGroup = new THREE.Group()
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 })
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = i * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
      
      const hPoints = [
        new THREE.Vector3(-(BOARD_SIZE - 1) * CELL_SIZE / 2, 0.01, pos),
        new THREE.Vector3((BOARD_SIZE - 1) * CELL_SIZE / 2, 0.01, pos)
      ]
      const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints)
      const hLine = new THREE.Line(hGeometry, lineMaterial)
      linesGroup.add(hLine)
      
      const vPoints = [
        new THREE.Vector3(pos, 0.01, -(BOARD_SIZE - 1) * CELL_SIZE / 2),
        new THREE.Vector3(pos, 0.01, (BOARD_SIZE - 1) * CELL_SIZE / 2)
      ]
      const vGeometry = new THREE.BufferGeometry().setFromPoints(vPoints)
      const vLine = new THREE.Line(vGeometry, lineMaterial)
      linesGroup.add(vLine)
    }
    
    const starPoints = [3, 7, 11]
    const starGeometry = new THREE.CircleGeometry(0.08, 16)
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
    
    for (const i of starPoints) {
      for (const j of starPoints) {
        const star = new THREE.Mesh(starGeometry, starMaterial)
        const x = j * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
        const z = i * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
        star.position.set(x, 0.015, z)
        star.rotation.x = -Math.PI / 2
        linesGroup.add(star)
      }
    }
    
    scene.add(linesGroup)
    
    const intersectionGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.05, 16)
    const intersectionMaterial = new THREE.MeshPhongMaterial({
      color: 0x654321,
      transparent: true,
      opacity: 0.0
    })
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      intersectionPointsRef.current[i] = []
      for (let j = 0; j < BOARD_SIZE; j++) {
        const point = new THREE.Mesh(intersectionGeometry, intersectionMaterial.clone())
        const x = j * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
        const z = i * CELL_SIZE - (BOARD_SIZE - 1) * CELL_SIZE / 2
        point.position.set(x, 0.025, z)
        point.userData = { row: i, col: j }
        scene.add(point)
        intersectionPointsRef.current[i][j] = point
      }
    }
    
    const hoverGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.08, 16)
    const hoverMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6
    })
    const hoverPoint = new THREE.Mesh(hoverGeometry, hoverMaterial)
    hoverPoint.visible = false
    scene.add(hoverPoint)
    hoverPointRef.current = hoverPoint
    
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (!rendererRef.current) return
    
    const onMouseMove = (event) => {
      if (winner) return
      
      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      
      let closest = null
      let minDistance = Infinity
      
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (board[i][j]) continue
          
          const point = intersectionPointsRef.current[i][j]
          const intersects = raycasterRef.current.intersectObject(point)
          
          if (intersects.length > 0) {
            if (intersects[0].distance < minDistance) {
              minDistance = intersects[0].distance
              closest = { row: i, col: j, point }
            }
          }
        }
      }
      
      if (hoverPointRef.current) {
        if (closest) {
          hoverPointRef.current.visible = true
          hoverPointRef.current.position.copy(closest.point.position)
          hoverPointRef.current.material.color.setHex(
            currentPlayer === 'black' ? 0x333333 : 0xcccccc
          )
        } else {
          hoverPointRef.current.visible = false
        }
      }
    }
    
    const onClick = (event) => {
      if (winner) return
      
      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      
      let closest = null
      let minDistance = Infinity
      
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (board[i][j]) continue
          
          const point = intersectionPointsRef.current[i][j]
          const intersects = raycasterRef.current.intersectObject(point)
          
          if (intersects.length > 0) {
            if (intersects[0].distance < minDistance) {
              minDistance = intersects[0].distance
              closest = { row: i, col: j }
            }
          }
        }
      }
      
      if (closest) {
        placePiece(closest.row, closest.col)
      }
    }
    
    rendererRef.current.domElement.addEventListener('mousemove', onMouseMove)
    rendererRef.current.domElement.addEventListener('click', onClick)
    
    return () => {
      if (rendererRef.current) {
        rendererRef.current.domElement.removeEventListener('mousemove', onMouseMove)
        rendererRef.current.domElement.removeEventListener('click', onClick)
      }
    }
  }, [board, currentPlayer, winner, placePiece])

  useEffect(() => {
    if (!sceneRef.current) return
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const piece = board[i][j]
        if (piece) {
          if (!piecesRef.current[i] || !piecesRef.current[i][j]) {
            createPiece(sceneRef.current, i, j, piece)
          }
        }
      }
    }
  }, [board, createPiece])

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)))
    setCurrentPlayer('black')
    setWinner(null)
    setMessage('黑棋先行')
    
    if (sceneRef.current) {
      for (let i = 0; i < piecesRef.current.length; i++) {
        if (piecesRef.current[i]) {
          for (let j = 0; j < piecesRef.current[i].length; j++) {
            if (piecesRef.current[i][j]) {
              sceneRef.current.remove(piecesRef.current[i][j])
              piecesRef.current[i][j].geometry.dispose()
              piecesRef.current[i][j].material.dispose()
            }
          }
        }
      }
      piecesRef.current = []
    }
  }

  return (
    <div className="game-container">
      <div ref={containerRef} className="canvas-container" />
      <div className="game-info">
        <h1>五子棋</h1>
        <div className={`message ${winner ? 'winner' : ''}`}>
          {message}
        </div>
        <div className="player-info">
          <div className={`player black ${currentPlayer === 'black' && !winner ? 'active' : ''}`}>
            <div className="player-piece black-piece"></div>
            <span>黑棋</span>
          </div>
          <div className={`player white ${currentPlayer === 'white' && !winner ? 'active' : ''}`}>
            <div className="player-piece white-piece"></div>
            <span>白棋</span>
          </div>
        </div>
        <button className="reset-btn" onClick={resetGame}>
          重新开始
        </button>
      </div>
    </div>
  )
}

export default App
