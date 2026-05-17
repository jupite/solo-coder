import { GameState, MoveDirection } from './types.js';
import { GameConfig } from './GameConfig.js';
import { Block } from './Block.js';
import { calculateOverlap, checkPerfectStack } from '../utils/collision.js';

export class GameManager {
  constructor() {
    this.state = GameState.IDLE;
    this.blocks = [];
    this.currentBlock = null;
    this.baseBlock = null;
    this.score = 0;
    this.streak = 0;
    this.layer = 0;
    this.nextMoveDirection = MoveDirection.X;
    this.blockIdCounter = 0;
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  start() {
    this.reset();
    this.state = GameState.PLAYING;
    this.spawnBaseBlock();
    this.spawnMovingBlock();
    this.emit('stateChanged', this.state);
  }

  reset() {
    this.blocks = [];
    this.currentBlock = null;
    this.baseBlock = null;
    this.score = 0;
    this.streak = 0;
    this.layer = 0;
    this.nextMoveDirection = MoveDirection.X;
    this.blockIdCounter = 0;
    this.state = GameState.IDLE;
  }

  spawnBaseBlock() {
    const block = new Block(
      this.blockIdCounter++,
      { x: 0, y: 0, z: 0 },
      { ...GameConfig.BASE_BLOCK_SIZE },
      GameConfig.COLORS.base
    );
    block.isBase = true;
    this.baseBlock = block;
    this.blocks.push(block);
    this.layer = 1;
    this.emit('blockSpawned', { block, isBase: true });
    this.emit('layerChanged', this.layer);
  }

  spawnMovingBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1];
    const direction = this.nextMoveDirection;
    const colorIndex = this.layer % GameConfig.COLORS.stack.length;

    const block = new Block(
      this.blockIdCounter++,
      {
        x: direction === MoveDirection.X ? -GameConfig.MOVE_RANGE : lastBlock.position.x,
        y: lastBlock.position.y + GameConfig.BLOCK_HEIGHT,
        z: direction === MoveDirection.Z ? -GameConfig.MOVE_RANGE : lastBlock.position.z
      },
      { ...lastBlock.size },
      GameConfig.COLORS.stack[colorIndex]
    );

    block.isMoving = true;
    block.moveDirection = direction;
    block.moveRange = GameConfig.MOVE_RANGE;
    block.moveSpeed = GameConfig.MOVE_SPEED;
    this.currentBlock = block;
    this.blocks.push(block);

    this.nextMoveDirection = direction === MoveDirection.X ? MoveDirection.Z : MoveDirection.X;
    this.emit('blockSpawned', { block, isMoving: true });
    this.emit('directionChanged', this.nextMoveDirection);
  }

  dropBlock() {
    if (this.state !== GameState.PLAYING || !this.currentBlock || !this.currentBlock.isMoving) {
      return;
    }

    this.state = GameState.STACKING;
    this.currentBlock.stop();

    const lastBlock = this.blocks[this.blocks.length - 2];
    const result = calculateOverlap(this.currentBlock, lastBlock);

    if (!result.hasOverlap) {
      this.gameOver();
      return;
    }

    if (result.cutParts.length > 0) {
      this.emit('cutParts', {
        parts: result.cutParts,
        color: this.currentBlock.color
      });
    }

    this.currentBlock.size = result.newSize;
    this.currentBlock.position = result.newPosition;

    const isPerfect = checkPerfectStack(this.currentBlock, lastBlock);
    if (isPerfect) {
      this.currentBlock.size = { ...lastBlock.size };
      this.currentBlock.position = {
        x: lastBlock.position.x,
        y: this.currentBlock.position.y,
        z: lastBlock.position.z
      };
      this.streak++;
      this.score += 100;
      this.emit('perfectStack', this.streak);
    } else {
      this.streak = 0;
      this.score += 10;
    }

    this.emit('blockStacked', {
      block: this.currentBlock,
      isPerfect,
      streak: this.streak
    });

    this.layer++;
    this.emit('layerChanged', this.layer);
    this.emit('scoreChanged', this.score);

    if (this.streak >= GameConfig.WIN_STREAK) {
      this.win();
      return;
    }

    setTimeout(() => {
      if (this.state === GameState.STACKING) {
        this.state = GameState.PLAYING;
        this.spawnMovingBlock();
        this.emit('stateChanged', this.state);
      }
    }, 300);
  }

  win() {
    this.state = GameState.WIN;
    this.emit('stateChanged', this.state);
    this.emit('win', { score: this.score, layer: this.layer });
  }

  gameOver() {
    this.state = GameState.GAME_OVER;
    this.emit('stateChanged', this.state);
    this.emit('gameOver', { score: this.score, layer: this.layer });
  }

  update(deltaTime) {
    if (this.currentBlock && this.currentBlock.isMoving) {
      this.currentBlock.update(deltaTime);
      this.emit('blockUpdated', this.currentBlock);
    }
  }

  getState() {
    return {
      gameState: this.state,
      layer: this.layer,
      score: this.score,
      streak: this.streak,
      nextDirection: this.nextMoveDirection
    };
  }
}
