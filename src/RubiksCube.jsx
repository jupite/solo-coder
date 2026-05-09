import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const RubiksCube = () => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const cubeRef = useRef(null)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })
  const isAnimatingRef = useRef(false)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const cubiesRef = useRef([])
  const meshToCubieMapRef = useRef(new Map())
  const startMousePosRef = useRef({ x: 0, y: 0 })

  const CUBIE_SIZE = 0.95
  const GAP = 0.05
  const TOTAL_SIZE = CUBIE_SIZE + GAP
  const RADIUS = 0.08

  const COLORS = {
    right: 0xff0000,
    left: 0xffa500,
    top: 0xffffff,
    bottom: 0xffff00,
    front: 0x00ff00,
    back: 0x0000ff
  }

  const createRoundedBoxGeometry = (size, r) => {
    const shape = new THREE.Shape()
    const eps = 0.0001
    shape.moveTo(-size / 2 + r, -size / 2)
    shape.lineTo(size / 2 - r, -size / 2 + eps)
    shape.quadraticCurveTo(size / 2, -size / 2, size / 2, -size / 2 + r)
    shape.lineTo(size / 2 - eps, size / 2 - r)
    shape.quadraticCurveTo(size / 2, size / 2, size / 2 - r, size / 2)
    shape.lineTo(-size / 2 + r, size / 2 - eps)
    shape.quadraticCurveTo(-size / 2, size / 2, -size / 2, size / 2 - r)
    shape.lineTo(-size / 2 + eps, -size / 2 + r)
    shape.quadraticCurveTo(-size / 2, -size / 2, -size / 2 + r, -size / 2)

    const extrudeSettings = {
      depth: size,
      bevelEnabled: false,
      curveSegments: 12
    }

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geometry.center()
    geometry.rotateX(Math.PI / 2)
    return geometry
  }

  const createCubies = (parent) => {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue

          const cubie = new THREE.Group()
          cubie.position.set(x * TOTAL_SIZE, y * TOTAL_SIZE, z * TOTAL_SIZE)
          cubie.userData = {
            gridX: x,
            gridY: y,
            gridZ: z
          }

          const blackMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.1
          })

          const baseGeometry = createRoundedBoxGeometry(CUBIE_SIZE, RADIUS)
          const baseCube = new THREE.Mesh(baseGeometry, blackMaterial)
          cubie.add(baseCube)
          meshToCubieMapRef.current.set(baseCube, cubie)

          const faceSize = CUBIE_SIZE * 0.9
          const faceOffset = CUBIE_SIZE / 2 + 0.001

          const createFace = (color, position, rotation) => {
            const faceGeometry = new THREE.PlaneGeometry(faceSize, faceSize)
            const faceMaterial = new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.4,
              metalness: 0.05,
              side: THREE.DoubleSide
            })
            const face = new THREE.Mesh(faceGeometry, faceMaterial)
            face.position.copy(position)
            face.rotation.copy(rotation)
            cubie.add(face)
            meshToCubieMapRef.current.set(face, cubie)
          }

          if (x === 1) {
            createFace(COLORS.right, new THREE.Vector3(faceOffset, 0, 0), new THREE.Euler(0, Math.PI / 2, 0))
          }
          if (x === -1) {
            createFace(COLORS.left, new THREE.Vector3(-faceOffset, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0))
          }
          if (y === 1) {
            createFace(COLORS.top, new THREE.Vector3(0, faceOffset, 0), new THREE.Euler(-Math.PI / 2, 0, 0))
          }
          if (y === -1) {
            createFace(COLORS.bottom, new THREE.Vector3(0, -faceOffset, 0), new THREE.Euler(Math.PI / 2, 0, 0))
          }
          if (z === 1) {
            createFace(COLORS.front, new THREE.Vector3(0, 0, faceOffset), new THREE.Euler(0, 0, 0))
          }
          if (z === -1) {
            createFace(COLORS.back, new THREE.Vector3(0, 0, -faceOffset), new THREE.Euler(0, Math.PI, 0))
          }

          parent.add(cubie)
          cubiesRef.current.push(cubie)
        }
      }
    }
  }

  const getCubiesInLayer = (axis, layerIndex) => {
    const cubies = []
    cubiesRef.current.forEach((cubie) => {
      const coord = axis === 'x' ? cubie.userData.gridX :
                   axis === 'y' ? cubie.userData.gridY :
                   cubie.userData.gridZ

      if (coord === layerIndex) {
        cubies.push(cubie)
      }
    })
    return cubies
  }

  const updateGridAfterRotation = (axis, layerIndex, isClockwise) => {
    const cubies = getCubiesInLayer(axis, layerIndex)
    
    cubies.forEach((cubie) => {
      const x = cubie.userData.gridX
      const y = cubie.userData.gridY
      const z = cubie.userData.gridZ

      let newX = x
      let newY = y
      let newZ = z

      if (axis === 'x') {
        if (isClockwise) {
          newY = z
          newZ = -y
        } else {
          newY = -z
          newZ = y
        }
      } else if (axis === 'y') {
        if (isClockwise) {
          newX = -z
          newZ = x
        } else {
          newX = z
          newZ = -x
        }
      } else {
        if (isClockwise) {
          newX = y
          newY = -x
        } else {
          newX = -y
          newY = x
        }
      }

      cubie.userData.gridX = newX
      cubie.userData.gridY = newY
      cubie.userData.gridZ = newZ
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(6, 6, 6)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(10, 10, 10)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-10, -10, -10)
    scene.add(directionalLight2)

    const cubeGroup = new THREE.Group()
    scene.add(cubeGroup)
    cubeRef.current = cubeGroup

    createCubies(cubeGroup)

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    const handleMouseDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouseRef.current.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1

      isDraggingRef.current = true
      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      }
      startMousePosRef.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    const handleMouseMove = (event) => {
      if (!isDraggingRef.current || isAnimatingRef.current) return

      const deltaMove = {
        x: event.clientX - previousMousePositionRef.current.x,
        y: event.clientY - previousMousePositionRef.current.y
      }

      const totalDeltaMove = {
        x: event.clientX - startMousePosRef.current.x,
        y: event.clientY - startMousePosRef.current.y
      }

      if (Math.abs(totalDeltaMove.x) < 5 && Math.abs(totalDeltaMove.y) < 5) {
        previousMousePositionRef.current = {
          x: event.clientX,
          y: event.clientY
        }
        return
      }

      const rect = renderer.domElement.getBoundingClientRect()
      mouseRef.current.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, camera)

      const allMeshes = []
      cubiesRef.current.forEach((cubie) => {
        cubie.children.forEach((child) => {
          if (child.isMesh) {
            allMeshes.push(child)
          }
        })
      })

      const intersects = raycasterRef.current.intersectObjects(allMeshes)

      if (intersects.length > 0 && !isAnimatingRef.current) {
        const mesh = intersects[0].object
        const cubie = meshToCubieMapRef.current.get(mesh)
        
        if (cubie) {
          const gridX = cubie.userData.gridX
          const gridY = cubie.userData.gridY
          const gridZ = cubie.userData.gridZ

          let axis = null
          let layerIndex = null
          let direction = 0

          const isHorizontal = Math.abs(totalDeltaMove.x) > Math.abs(totalDeltaMove.y)

          if (isHorizontal) {
            const possibleAxes = []
            
            possibleAxes.push({ axis: 'y', index: gridY, dir: totalDeltaMove.x > 0 ? 1 : -1 })
            possibleAxes.push({ axis: 'z', index: gridZ, dir: totalDeltaMove.x > 0 ? -1 : 1 })
            possibleAxes.push({ axis: 'x', index: gridX, dir: totalDeltaMove.x > 0 ? -1 : 1 })

            if (possibleAxes.length > 0) {
              const preferred = possibleAxes.find(a => a.axis === 'y') || 
                              possibleAxes.find(a => a.axis === 'z') || 
                              possibleAxes[0]
              axis = preferred.axis
              layerIndex = preferred.index
              direction = preferred.dir
            }
          } else {
            const possibleAxes = []
            
            possibleAxes.push({ axis: 'x', index: gridX, dir: totalDeltaMove.y > 0 ? 1 : -1 })
            possibleAxes.push({ axis: 'z', index: gridZ, dir: totalDeltaMove.y > 0 ? 1 : -1 })
            possibleAxes.push({ axis: 'y', index: gridY, dir: totalDeltaMove.y > 0 ? -1 : 1 })

            if (possibleAxes.length > 0) {
              const preferred = possibleAxes.find(a => a.axis === 'x') || 
                              possibleAxes.find(a => a.axis === 'z') || 
                              possibleAxes[0]
              axis = preferred.axis
              layerIndex = preferred.index
              direction = preferred.dir
            }
          }

          if (axis && layerIndex !== null) {
            rotateLayer(axis, layerIndex, direction)
          }
        }
      } else {
        targetRotationRef.current.y += deltaMove.x * 0.01
        targetRotationRef.current.x += deltaMove.y * 0.01
      }

      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const rotateLayer = (axis, layerIndex, direction) => {
      if (isAnimatingRef.current) return

      const cubies = getCubiesInLayer(axis, layerIndex)
      if (cubies.length === 0) return

      const isClockwise = direction > 0

      const savedRotation = {
        x: cubeRef.current.rotation.x,
        y: cubeRef.current.rotation.y,
        z: cubeRef.current.rotation.z
      }

      cubeRef.current.rotation.set(0, 0, 0)
      cubeRef.current.updateMatrixWorld(true)

      const layerGroup = new THREE.Group()
      cubeRef.current.add(layerGroup)

      cubies.forEach((cubie) => {
        const worldPos = new THREE.Vector3()
        const worldQuat = new THREE.Quaternion()
        cubie.getWorldPosition(worldPos)
        cubie.getWorldQuaternion(worldQuat)

        cubeRef.current.remove(cubie)
        layerGroup.add(cubie)

        const localPos = layerGroup.worldToLocal(worldPos.clone())
        cubie.position.copy(localPos)
        cubie.quaternion.copy(worldQuat)
      })

      isAnimatingRef.current = true
      const totalRotation = isClockwise ? -Math.PI / 2 : Math.PI / 2
      const duration = 300
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        if (axis === 'x') {
          layerGroup.rotation.x = totalRotation * eased
        } else if (axis === 'y') {
          layerGroup.rotation.y = totalRotation * eased
        } else {
          layerGroup.rotation.z = totalRotation * eased
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          updateGridAfterRotation(axis, layerIndex, isClockwise)

          cubies.forEach((cubie) => {
            const worldPos = new THREE.Vector3()
            const worldQuat = new THREE.Quaternion()
            cubie.getWorldPosition(worldPos)
            cubie.getWorldQuaternion(worldQuat)

            layerGroup.remove(cubie)
            cubeRef.current.add(cubie)

            cubie.position.set(
              cubie.userData.gridX * TOTAL_SIZE,
              cubie.userData.gridY * TOTAL_SIZE,
              cubie.userData.gridZ * TOTAL_SIZE
            )
            cubie.quaternion.copy(worldQuat)
          })

          cubeRef.current.remove(layerGroup)
          cubeRef.current.rotation.copy(savedRotation)
          targetRotationRef.current.x = savedRotation.x
          targetRotationRef.current.y = savedRotation.y
          cubeRef.current.updateMatrixWorld(true)

          isAnimatingRef.current = false
        }
      }

      animate()
    }

    window.addEventListener('resize', handleResize)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    const animateScene = () => {
      requestAnimationFrame(animateScene)

      if (!isAnimatingRef.current) {
        cubeRef.current.rotation.x += (targetRotationRef.current.x - cubeRef.current.rotation.x) * 0.1
        cubeRef.current.rotation.y += (targetRotationRef.current.y - cubeRef.current.rotation.y) * 0.1
      }

      renderer.render(scene, camera)
    }

    animateScene()

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        cursor: 'grab'
      }}
    />
  )
}

export default RubiksCube
