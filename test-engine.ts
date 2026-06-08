import { CellType, DuoGravityLevelData } from './src/lib/game/types';
import { createDuoGravityGameState, moveDuoGravityPlayer, undoDuoGravityMove } from './src/lib/game/duo-gravity-engine';

const testLevel: DuoGravityLevelData = {
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ] as CellType[][],
  bluePlayer: { x: 1, y: 5 },
  redPlayer: { x: 6, y: 5 },
  boxes: [],
  targets: [
    { x: 3, y: 6 },
    { x: 4, y: 6 },
  ],
};

console.log('=== 测试重力模式游戏引擎 ===\n');

const state = createDuoGravityGameState(testLevel);
console.log('初始状态:');
console.log('  蓝:', state.bluePlayer.position);
console.log('  红:', state.redPlayer.position);
console.log('  轮次:', state.currentTurn);
console.log('  步数:', state.steps);
console.log('  历史长度:', state.history.length);
console.log('');

let s = state;
for (let i = 0; i < 6; i++) {
  const player = s.currentTurn;
  s = moveDuoGravityPlayer(s, player, 'right');
  console.log('第 ' + (i + 1) + ' 步 (' + player + ' 右移):');
  console.log('  蓝:', s.bluePlayer.position);
  console.log('  红:', s.redPlayer.position);
  console.log('  轮次:', s.currentTurn);
  console.log('  步数:', s.steps);
  console.log('  历史长度:', s.history.length);
}

console.log('\n=== 测试撤销 ===');
for (let i = 0; i < 3; i++) {
  s = undoDuoGravityMove(s);
  console.log('撤销 ' + (i + 1) + ' 次后:');
  console.log('  蓝:', s.bluePlayer.position);
  console.log('  红:', s.redPlayer.position);
  console.log('  轮次:', s.currentTurn);
  console.log('  步数:', s.steps);
  console.log('  历史长度:', s.history.length);
}

console.log('\n=== 测试向上移动 ===');
const sUp = createDuoGravityGameState(testLevel);
console.log('初始 蓝:', sUp.bluePlayer.position);
const sUp2 = moveDuoGravityPlayer(sUp, 'blue', 'up');
console.log('上移后 蓝:', sUp2.bluePlayer.position, ' 轮次:', sUp2.currentTurn);
const sUp3 = moveDuoGravityPlayer(sUp2, 'red', 'up');
console.log('红上移后 红:', sUp3.redPlayer.position, ' 轮次:', sUp3.currentTurn);

console.log('\n=== 测试完成 ===');
