import * as THREE from 'three'

export class SceneManager {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.trackSegments = []
    this.segmentLength = 100
    this.trackGroup = null
    this.init()
  }

  init() {
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createLighting()
    this.createInfiniteTrack()
    window.addEventListener('resize', () => this.onWindowResize())
  }

  createScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(-10, 6, 10)
    this.camera.lookAt(5, 2, 0)
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    document.getElementById('game-container').appendChild(this.renderer.domElement)
  }

  createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
  }

  createTrackSegment(xStart) {
    const group = new THREE.Group()
    
    const groundGeometry = new THREE.PlaneGeometry(this.segmentLength, 6)
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    group.add(ground)
    
    const leftBorderGeometry = new THREE.BoxGeometry(this.segmentLength, 0.5, 0.3)
    const leftBorderMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff })
    const leftBorder = new THREE.Mesh(leftBorderGeometry, leftBorderMaterial)
    leftBorder.position.set(0, 0.25, -3.15)
    group.add(leftBorder)
    
    const rightBorderGeometry = new THREE.BoxGeometry(this.segmentLength, 0.5, 0.3)
    const rightBorderMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff })
    const rightBorder = new THREE.Mesh(rightBorderGeometry, rightBorderMaterial)
    rightBorder.position.set(0, 0.25, 3.15)
    group.add(rightBorder)
    
    const laneLineGeometry = new THREE.PlaneGeometry(this.segmentLength, 0.1)
    const laneLineMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const laneLine = new THREE.Mesh(laneLineGeometry, laneLineMaterial)
    laneLine.rotation.x = -Math.PI / 2
    laneLine.position.set(0, 0.01, 0)
    group.add(laneLine)
    
    group.position.x = xStart
    return group
  }

  createInfiniteTrack() {
    this.trackGroup = new THREE.Group()
    for (let i = -2; i <= 3; i++) {
      const segment = this.createTrackSegment(i * this.segmentLength)
      this.trackSegments.push(segment)
      this.trackGroup.add(segment)
    }
    this.scene.add(this.trackGroup)
  }

  updateTrack(playerX) {
    for (let i = this.trackSegments.length - 1; i >= 0; i--) {
      const segment = this.trackSegments[i]
      if (segment.position.x + this.segmentLength / 2 < playerX - this.segmentLength) {
        segment.position.x += this.segmentLength * 5
      }
    }
  }

  render(playerPosition, speed) {
    this.updateTrack(playerPosition.x)
    
    const targetX = playerPosition.x - 10
    this.camera.position.x += (targetX - this.camera.position.x) * 0.1
    this.camera.lookAt(playerPosition.x + 5, 2, 0)
    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}