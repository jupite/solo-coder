import * as THREE from 'three'
import { GAME_CONFIG } from '../config'

export class IceRink {
  mesh: THREE.Group

  constructor() {
    this.mesh = new THREE.Group()
    this.createIceRink()
  }

  private createIceRink() {
    const { RINK_LENGTH, RINK_WIDTH } = GAME_CONFIG

    const iceGeometry = new THREE.PlaneGeometry(RINK_WIDTH, RINK_LENGTH)
    const iceMaterial = new THREE.MeshStandardMaterial({
      color: 0xe3f2fd,
      roughness: 0.1,
      metalness: 0.1,
    })
    const ice = new THREE.Mesh(iceGeometry, iceMaterial)
    ice.rotation.x = -Math.PI / 2
    ice.receiveShadow = true
    this.mesh.add(ice)

    const borderMaterial = new THREE.MeshStandardMaterial({
      color: 0x1565c0,
      roughness: 0.5,
    })

    const borderHeight = 0.3
    const borderThickness = 0.2

    const leftBorder = new THREE.Mesh(
      new THREE.BoxGeometry(borderThickness, borderHeight, RINK_LENGTH),
      borderMaterial,
    )
    leftBorder.position.set(-RINK_WIDTH / 2 - borderThickness / 2, borderHeight / 2, 0)
    this.mesh.add(leftBorder)

    const rightBorder = new THREE.Mesh(
      new THREE.BoxGeometry(borderThickness, borderHeight, RINK_LENGTH),
      borderMaterial,
    )
    rightBorder.position.set(RINK_WIDTH / 2 + borderThickness / 2, borderHeight / 2, 0)
    this.mesh.add(rightBorder)

    const backBorder = new THREE.Mesh(
      new THREE.BoxGeometry(RINK_WIDTH + borderThickness * 2, borderHeight, borderThickness),
      borderMaterial,
    )
    backBorder.position.set(0, borderHeight / 2, -RINK_LENGTH / 2 - borderThickness / 2)
    this.mesh.add(backBorder)

    const frontBorder = new THREE.Mesh(
      new THREE.BoxGeometry(RINK_WIDTH + borderThickness * 2, borderHeight, borderThickness),
      borderMaterial,
    )
    frontBorder.position.set(0, borderHeight / 2, RINK_LENGTH / 2 + borderThickness / 2)
    this.mesh.add(frontBorder)

    const centerLineGeometry = new THREE.BufferGeometry()
    const centerLinePoints = [
      new THREE.Vector3(0, 0.01, -RINK_LENGTH / 2),
      new THREE.Vector3(0, 0.01, RINK_LENGTH / 2),
    ]
    centerLineGeometry.setFromPoints(centerLinePoints)
    const centerLineMaterial = new THREE.LineBasicMaterial({
      color: 0x1976d2,
      transparent: true,
      opacity: 0.5,
    })
    const centerLine = new THREE.Line(centerLineGeometry, centerLineMaterial)
    this.mesh.add(centerLine)

    const hogLineZ1 = 10
    const hogLineZ2 = -10
    const hogLineGeometry1 = new THREE.BufferGeometry()
    hogLineGeometry1.setFromPoints([
      new THREE.Vector3(-RINK_WIDTH / 2, 0.01, hogLineZ1),
      new THREE.Vector3(RINK_WIDTH / 2, 0.01, hogLineZ1),
    ])
    const hogLine1 = new THREE.Line(hogLineGeometry1, centerLineMaterial)
    this.mesh.add(hogLine1)

    const hogLineGeometry2 = new THREE.BufferGeometry()
    hogLineGeometry2.setFromPoints([
      new THREE.Vector3(-RINK_WIDTH / 2, 0.01, hogLineZ2),
      new THREE.Vector3(RINK_WIDTH / 2, 0.01, hogLineZ2),
    ])
    const hogLine2 = new THREE.Line(hogLineGeometry2, centerLineMaterial)
    this.mesh.add(hogLine2)
  }

  getMesh(): THREE.Group {
    return this.mesh
  }
}
