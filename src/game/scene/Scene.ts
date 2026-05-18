import * as THREE from 'three'
import { IceRink } from './IceRink'
import { House } from './House'
import { Stone } from './Stone'

export class GameScene {
  scene: THREE.Scene
  iceRink: IceRink
  house: House
  stones: Stone[] = []
  private ambientLight: THREE.AmbientLight
  private directionalLight: THREE.DirectionalLight

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(this.ambientLight)

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.directionalLight.position.set(10, 20, 10)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 50
    this.directionalLight.shadow.camera.left = -15
    this.directionalLight.shadow.camera.right = 15
    this.directionalLight.shadow.camera.top = 30
    this.directionalLight.shadow.camera.bottom = -30
    this.scene.add(this.directionalLight)

    this.iceRink = new IceRink()
    this.scene.add(this.iceRink.getMesh())

    this.house = new House()
    this.scene.add(this.house.getMesh())
  }

  addStone(stone: Stone) {
    this.stones.push(stone)
    this.scene.add(stone.getMesh())
  }

  removeStone(stone: Stone) {
    const index = this.stones.indexOf(stone)
    if (index > -1) {
      this.stones.splice(index, 1)
      this.scene.remove(stone.getMesh())
    }
  }

  clearStones() {
    this.stones.forEach((stone) => {
      this.scene.remove(stone.getMesh())
    })
    this.stones = []
  }

  getHouseCenter(): THREE.Vector3 {
    return this.house.getCenter()
  }

  getScene(): THREE.Scene {
    return this.scene
  }
}
