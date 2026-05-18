import * as THREE from 'three'
import { GAME_CONFIG } from '../config'

export class House {
  mesh: THREE.Group

  constructor() {
    this.mesh = new THREE.Group()
    this.createHouse()
  }

  private createHouse() {
    const { HOUSE_RADIUSES, HOUSE_COLORS, HOUSE_CENTER_Z } = GAME_CONFIG

    for (let i = HOUSE_RADIUSES.length - 1; i >= 0; i--) {
      const radius = HOUSE_RADIUSES[i]
      const color = HOUSE_COLORS[i]

      const ringGeometry = new THREE.RingGeometry(
        i === HOUSE_RADIUSES.length - 1 ? 0 : HOUSE_RADIUSES[i + 1],
        radius,
        64,
      )
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(0, 0.02, HOUSE_CENTER_Z)
      this.mesh.add(ring)
    }

    const centerGeometry = new THREE.CircleGeometry(HOUSE_RADIUSES[0] * 0.3, 32)
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5722,
      side: THREE.DoubleSide,
    })
    const center = new THREE.Mesh(centerGeometry, centerMaterial)
    center.rotation.x = -Math.PI / 2
    center.position.set(0, 0.03, HOUSE_CENTER_Z)
    this.mesh.add(center)

    const outlineGeometry = new THREE.RingGeometry(
      HOUSE_RADIUSES[HOUSE_RADIUSES.length - 1],
      HOUSE_RADIUSES[HOUSE_RADIUSES.length - 1] + 0.02,
      64,
    )
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    })
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial)
    outline.rotation.x = -Math.PI / 2
    outline.position.set(0, 0.025, HOUSE_CENTER_Z)
    this.mesh.add(outline)
  }

  getMesh(): THREE.Group {
    return this.mesh
  }

  getCenter(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, GAME_CONFIG.HOUSE_CENTER_Z)
  }
}
