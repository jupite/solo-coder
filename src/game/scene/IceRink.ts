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

    const edgeGeometry = new THREE.EdgesGeometry(
      new THREE.PlaneGeometry(RINK_WIDTH, RINK_LENGTH),
    )
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x1565c0,
      linewidth: 2,
    })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    edges.rotation.x = -Math.PI / 2
    edges.position.y = 0.01
    this.mesh.add(edges)

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

    const backLineZ = -RINK_LENGTH / 2
    const backLineGeometry = new THREE.BufferGeometry()
    backLineGeometry.setFromPoints([
      new THREE.Vector3(-RINK_WIDTH / 2, 0.01, backLineZ),
      new THREE.Vector3(RINK_WIDTH / 2, 0.01, backLineZ),
    ])
    const backLineMaterial = new THREE.LineBasicMaterial({ color: 0x0d47a1, linewidth: 3 })
    const backLine = new THREE.Line(backLineGeometry, backLineMaterial)
    this.mesh.add(backLine)

    const hackZ = RINK_LENGTH / 2 - 0.5
    const hackGeometry = new THREE.BufferGeometry()
    hackGeometry.setFromPoints([
      new THREE.Vector3(-0.3, 0.01, hackZ),
      new THREE.Vector3(0.3, 0.01, hackZ),
    ])
    const hackMaterial = new THREE.LineBasicMaterial({ color: 0xff5722, linewidth: 3 })
    const hack = new THREE.Line(hackGeometry, hackMaterial)
    this.mesh.add(hack)
  }

  getMesh(): THREE.Group {
    return this.mesh
  }
}
