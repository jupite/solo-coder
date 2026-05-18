import * as THREE from 'three'
import { GAME_CONFIG } from '../config'
import type { CameraMode } from '../types'

export class CameraController {
  camera: THREE.PerspectiveCamera
  mode: CameraMode = 'default'
  target: THREE.Vector3 = new THREE.Vector3()
  followTarget: THREE.Object3D | null = null

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    this.setMode('default')
  }

  setMode(mode: CameraMode) {
    this.mode = mode
    this.updatePosition()
  }

  setFollowTarget(target: THREE.Object3D | null) {
    this.followTarget = target
  }

  updatePosition() {
    const { CAMERA_DEFAULT, CAMERA_TOP } = GAME_CONFIG

    switch (this.mode) {
      case 'default':
        this.camera.position.set(
          CAMERA_DEFAULT.position.x,
          CAMERA_DEFAULT.position.y,
          CAMERA_DEFAULT.position.z,
        )
        this.target.set(
          CAMERA_DEFAULT.target.x,
          CAMERA_DEFAULT.target.y,
          CAMERA_DEFAULT.target.z,
        )
        break
      case 'top':
        this.camera.position.set(
          CAMERA_TOP.position.x,
          CAMERA_TOP.position.y,
          CAMERA_TOP.position.z,
        )
        this.target.set(
          CAMERA_TOP.target.x,
          CAMERA_TOP.target.y,
          CAMERA_TOP.target.z,
        )
        break
      case 'follow':
        if (this.followTarget) {
          const pos = this.followTarget.position
          this.camera.position.set(pos.x, pos.y + 8, pos.z + 12)
          this.target.set(pos.x, pos.y, pos.z - 5)
        } else {
          this.setMode('default')
        }
        break
    }

    this.camera.lookAt(this.target)
  }

  update(deltaTime: number) {
    if (this.mode === 'follow' && this.followTarget) {
      const pos = this.followTarget.position
      const targetPos = new THREE.Vector3(pos.x, pos.y + 8, pos.z + 12)
      this.camera.position.lerp(targetPos, deltaTime * 3)
      this.target.set(pos.x, pos.y, pos.z - 5)
      this.camera.lookAt(this.target)
    }
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }
}
