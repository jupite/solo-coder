import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const RubiksCube = () => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const cubeRef = useRef(null)
  const cubiesRef = useRef([])
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })
  const hoveredCubieRef = useRef(null)
  const isAnimatingRef = useRef(false)
  const currentLayerGroupRef = useRef(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

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

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(
        cubiesRef.current,
        true
      )

      if (intersects.length > 0 && !isAnimatingRef.current) {
        hoveredCubieRef.current = intersects[0].object
        isDraggingRef.current = true
      } else {
        isDraggingRef.current = true
        hoveredCubieRef.current = null
      }

      previousMousePositionRef.current = {
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

      if (hoveredCubieRef.current && cubiesRef.current.length > 0) {
        const absolute = new THREE.Vector3()
        hoveredCubieRef.current.getWorldPosition(absolute)

        let axis = null
        let isPositive = false
        const threshold = 1

        if (Math.abs(deltaMove.x) > Math.abs(deltaMove.y)) {
          if (Math.abs(absolute.y) > threshold) {
            axis = 'y'
            isPositive = absolute.y > 0
          } else if (Math.abs(absolute.z) > threshold) {
            axis = 'z'
            isPositive = absolute.z > 0
          } else {
            axis = 'x'
            isPositive = absolute.x > 0
          }
        } else {
          if (Math.abs(absolute.x) > threshold) {
            axis = 'x'
            isPositive = absolute.x > 0
          } else if (Math.abs(absolute.z) > threshold) {
            axis = 'z'
            isPositive = absolute.z > 0
          } else {
            axis = 'y'
            isPositive = absolute.y > 0
          }
        }

        rotateLayer(axis, isPositive, deltaMove.x > 0 || deltaMove.y > 0)
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
      hoveredCubieRef.current = null
    }

    const attachToParent = (child, oldParent, newParent) => {
      oldParent.remove(child)
      newParent.add(child)
    }

    const rotateLayer = (axis, isPositive, clockwise) => {
      if (isAnimatingRef.current) return

      const layerGroup = new THREE.Group()
      cubeRef.current.add(layerGroup)
      currentLayerGroupRef.current = layerGroup

      const layerCubies = cubiesRef.current.filter((cubie) => {
        const pos = new THREE.Vector3()
        cubie.getWorldPosition(pos)
        const epsilon = 0.1

        if (axis === 'x') {
          return isPositive ? pos.x > 1 - epsilon : pos.x < -1 + epsilon
        } else if (axis === 'y') {
          return isPositive ? pos.y > 1 - epsilon : pos.y < -1 + epsilon
        } else {
          return isPositive ? pos.z > 1 - epsilon : pos.z < -1 + epsilon
        }
      })

      layerCubies.forEach((cubie) => {
        const worldPos = new THREE.Vector3()
        const worldQuat = new THREE.Quaternion()
        cubie.getWorldPosition(worldPos)
        cubie.getWorldQuaternion(worldQuat)

        attachToParent(cubie, cubeRef.current, layerGroup)

        const localPos = layerGroup.worldToLocal(worldPos.clone())
        cubie.position.copy(localPos)
        cubie.quaternion.copy(worldQuat)
        layerGroup.worldToLocal(cubie.quaternion)
      })

      isAnimatingRef.current = true
      const totalRotation = (clockwise ? 1 : -1) * Math.PI / 2
      const duration = 300
      const startTime = Date.now()
      const startRotation = { x: layerGroup.rotation.x, y: layerGroup.rotation.y, z: layerGroup.rotation.z }

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        if (axis === 'x') {
          layerGroup.rotation.x = startRotation.x + totalRotation * eased
        } else if (axis === 'y') {
          layerGroup.rotation.y = startRotation.y + totalRotation * eased
        } else {
          layerGroup.rotation.z = startRotation.z + totalRotation * eased
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          layerCubies.forEach((cubie) => {
            const worldPos = new THREE.Vector3()
            const worldQuat = new THREE.Quaternion()
            cubie.getWorldPosition(worldPos)
            cubie.getWorldQuaternion(worldQuat)

            attachToParent(cubie, layerGroup, cubeRef.current)

            const localPos = cubeRef.current.worldToLocal(worldPos.clone())
            cubie.position.copy(localPos)
            cubie.quaternion.copy(worldQuat)
            cubeRef.current.worldToLocal(cubie.quaternion)

            cubie.position.round()
            cubie.rotation.x = Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2)
            cubie.rotation.y = Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2)
            cubie.rotation.z = Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
          })

          cubeRef.current.remove(layerGroup)
          isAnimatingRef.current = false
          currentLayerGroupRef.current = null
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

  const createCubies = (parent) => {
    const cubySize = 0.95
    const gap = 0.05
    const totalSize = cubySize + gap
    const radius = 0.08

    const colors = {
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

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue

          const cubie = new THREE.Group()
          cubie.position.set(x * totalSize, y * totalSize, z * totalSize)
          cubie.userData = { originalPosition: { x, y, z } }

          const blackMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.1
          })

          const baseGeometry = createRoundedBoxGeometry(cubySize, radius)
          const baseCube = new THREE.Mesh(baseGeometry, blackMaterial)
          cubie.add(baseCube)

          const faceSize = cubySize * 0.9
          const faceOffset = cubySize / 2 + 0.001

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
          }

          if (x === 1) {
            createFace(colors.right, new THREE.Vector3(faceOffset, 0, 0), new THREE.Euler(0, Math.PI / 2, 0))
          }
          if (x === -1) {
            createFace(colors.left, new THREE.Vector3(-faceOffset, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0))
          }
          if (y === 1) {
            createFace(colors.top, new THREE.Vector3(0, faceOffset, 0), new THREE.Euler(-Math.PI / 2, 0, 0))
          }
          if (y === -1) {
            createFace(colors.bottom, new THREE.Vector3(0, -faceOffset, 0), new THREE.Euler(Math.PI / 2, 0, 0))
          }
          if (z === 1) {
            createFace(colors.front, new THREE.Vector3(0, 0, faceOffset), new THREE.Euler(0, 0, 0))
          }
          if (z === -1) {
            createFace(colors.back, new THREE.Vector3(0, 0, -faceOffset), new THREE.Euler(0, Math.PI, 0))
          }

          parent.add(cubie)
          cubiesRef.current.push(cubie)
        }
      }
    }
  }

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
