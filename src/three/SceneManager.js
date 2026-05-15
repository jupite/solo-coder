import * as THREE from 'three'

export class SceneManager {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.trackOffset = 0
    this.trackLength = 50
    this.init()
  }

  init() {
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createLighting()
    this.createTrack()
    this.animateTrack()
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
    this.camera.position.set(-10, 8, 10)
    this.camera.lookAt(0, 2, 0)
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

  createTrack() {
    const trackGroup = new THREE.Group()
    
    const groundGeometry = new THREE.PlaneGeometry(1000, 6)
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    trackGroup.add(ground)
    
    const leftBorderGeometry = new THREE.BoxGeometry(1000, 0.5, 0.3)
    const leftBorderMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff })
    const leftBorder = new THREE.Mesh(leftBorderGeometry, leftBorderMaterial)
    leftBorder.position.set(0, 0.25, -3.15)
    trackGroup.add(leftBorder)
    
    const rightBorderGeometry = new THREE.BoxGeometry(1000, 0.5, 0.3)
    const rightBorderMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff })
    const rightBorder = new THREE.Mesh(rightBorderGeometry, rightBorderMaterial)
    rightBorder.position.set(0, 0.25, 3.15)
    trackGroup.add(rightBorder)
    
    const laneLineGeometry = new THREE.PlaneGeometry(1000, 0.1)
    const laneLineMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const laneLine = new THREE.Mesh(laneLineGeometry, laneLineMaterial)
    laneLine.rotation.x = -Math.PI / 2
    laneLine.position.set(0, 0.01, 0)
    trackGroup.add(laneLine)
    
    this.scene.add(trackGroup)
  }

  animateTrack() {
    const animate = () => {
      requestAnimationFrame(animate)
    }
    animate()
  }

  render(playerPosition) {
    const targetX = playerPosition.x - 10
    this.camera.position.x += (targetX - this.camera.position.x) * 0.1
    this.camera.lookAt(playerPosition.x, playerPosition.y + 1, 0)
    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}