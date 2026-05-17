export class Block {
  constructor(id, position, size, color) {
    this.id = id;
    this.position = { ...position };
    this.size = { ...size };
    this.color = color;
    this.isBase = false;
    this.isMoving = false;
    this.moveDirection = 'x';
    this.moveRange = 4;
    this.moveSpeed = 3;
    this.currentOffset = 0;
    this.moveDirectionSign = 1;
  }

  update(deltaTime) {
    if (!this.isMoving) return;

    this.currentOffset += this.moveSpeed * this.moveDirectionSign * deltaTime;

    if (Math.abs(this.currentOffset) >= this.moveRange) {
      this.moveDirectionSign *= -1;
      this.currentOffset = Math.sign(this.currentOffset) * this.moveRange;
    }

    if (this.moveDirection === 'x') {
      this.position.x = this.currentOffset;
    } else {
      this.position.z = this.currentOffset;
    }
  }

  stop() {
    this.isMoving = false;
  }
}
