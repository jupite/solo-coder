export class InputManager {
  constructor(container) {
    this.container = container
    this.mouseX = 0
    this.keys = {
      left: false,
      right: false
    }
    this.moveSpeed = 0.3
    this.boundary = 10
    this.init()
  }

  init() {
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.container.addEventListener('touchmove', (e) => this.onTouchMove(e))
    this.container.addEventListener('touchstart', (e) => this.onTouchStart(e))
    window.addEventListener('keydown', (e) => this.onKeyDown(e))
    window.addEventListener('keyup', (e) => this.onKeyUp(e))
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const centerX = rect.width / 2
    this.mouseX = ((x - centerX) / centerX) * this.boundary
  }

  onTouchMove(e) {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const rect = this.container.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const centerX = rect.width / 2
      this.mouseX = ((x - centerX) / centerX) * this.boundary
    }
  }

  onTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const rect = this.container.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const centerX = rect.width / 2
      this.mouseX = ((x - centerX) / centerX) * this.boundary
    }
  }

  onKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.keys.left = true
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = true
    }
  }

  onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.keys.left = false
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = false
    }
  }

  getTargetX(currentX, deltaTime) {
    let targetX = this.mouseX

    if (this.keys.left) {
      targetX = currentX - this.moveSpeed * deltaTime * 60
    }
    if (this.keys.right) {
      targetX = currentX + this.moveSpeed * deltaTime * 60
    }

    return Math.max(-this.boundary, Math.min(this.boundary, targetX))
  }

  dispose() {
    this.container.removeEventListener('mousemove', (e) => this.onMouseMove(e))
    this.container.removeEventListener('touchmove', (e) => this.onTouchMove(e))
    this.container.removeEventListener('touchstart', (e) => this.onTouchStart(e))
    window.removeEventListener('keydown', (e) => this.onKeyDown(e))
    window.removeEventListener('keyup', (e) => this.onKeyUp(e))
  }
}
