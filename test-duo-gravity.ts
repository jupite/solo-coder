import { createDuoGravityGameState, moveDuoGravityPlayer, checkDuoGravityWin, resetDuoGravityGame } from './src/lib/game/duo-gravity-engine';
import { duoGravityLevels } from './src/lib/game/duo-gravity-levels';
import type { PlayerColor, Direction, Position } from './src/lib/game/types';

function printState(state: any) {
  const rows = state.grid.length;
  const cols = state.grid[0].length;
  const grid: string[][] = [];
  
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      const cell = state.grid[y][x];
      if (cell === 1) {
        grid[y][x] = '#';
      } else if (cell === 2) {
        grid[y][x] = '.';
      } else {
        grid[y][x] = ' ';
      }
    }
  }

  for (const t of state.targets) {
    if (grid[t.y][t.x] === ' ') {
      grid[t.y][t.x] = '.';
    }
  }

  for (const b of state.boxes) {
    const onTarget = state.targets.some((t: any) => t.x === b.x && t.y === b.y);
    grid[b.y][b.x] = onTarget ? '*' : 'B';
  }

  if (state.bluePlayer) {
    const p = state.bluePlayer.position;
    const onTarget = state.targets.some((t: any) => t.x === p.x && t.y === p.y);
    const hasBox = state.boxes.some((b: any) => b.x === p.x && b.y === p.y);
    if (hasBox) {
      grid[p.y][p.x] = 'X';
    } else {
      grid[p.y][p.x] = onTarget ? '@' : 'b';
    }
  }
  if (state.redPlayer) {
    const p = state.redPlayer.position;
    const onTarget = state.targets.some((t: any) => t.x === p.x && t.y === p.y);
    const hasBox = state.boxes.some((b: any) => b.x === p.x && b.y === p.y);
    if (hasBox) {
      grid[p.y][p.x] = 'X';
    } else {
      grid[p.y][p.x] = onTarget ? '%' : 'r';
    }
  }

  console.log('  ' + '01234567890123456789'.slice(0, cols));
  for (let y = 0; y < rows; y++) {
    const line = (y < 10 ? ' ' : '') + y + ' ' + grid[y].join('');
    console.log(line);
  }
  console.log(`Turn: ${state.currentTurn}, Steps: ${state.steps}, Win: ${state.isWin}`);
  console.log(`Blue: (${state.bluePlayer.position.x},${state.bluePlayer.position.y}) onTarget: ${state.bluePlayer.onTarget}`);
  console.log(`Red: (${state.redPlayer.position.x},${state.redPlayer.position.y}) onTarget: ${state.redPlayer.onTarget}`);
  console.log('---');
}

function runTest(name: string, levelIndex: number, moves: { color: PlayerColor; dir: Direction }[]) {
  console.log(`=== Test: ${name} ===`);
  let state = createDuoGravityGameState(duoGravityLevels[levelIndex]);
  printState(state);

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    console.log(`Move ${i + 1}: ${move.color} ${move.dir}`);
    const prevState = state;
    state = moveDuoGravityPlayer(state, move.color, move.dir);
    if (state === prevState) {
      console.log('(Move failed - state unchanged)');
    }
    printState(state);
    if (state.isWin) {
      console.log('🎉 WIN!');
      break;
    }
  }

  console.log(`Final Win: ${checkDuoGravityWin(state)}`);
  console.log('');
  return state;
}

console.log('=== Testing Duo Gravity Engine ===');
console.log('');

// 测试关卡1
console.log('--- Level 1: 重力初识 ---');
let state1 = createDuoGravityGameState(duoGravityLevels[0]);
console.log('初始状态（箱子和玩家受重力下落）：');
printState(state1);
console.log('');

// 测试关卡2
console.log('--- Level 2: 攀登高地 ---');
let state2 = createDuoGravityGameState(duoGravityLevels[1]);
console.log('初始状态：');
printState(state2);
console.log('');

// 测试关卡3
console.log('--- Level 3: 双箱推动 ---');
let state3 = createDuoGravityGameState(duoGravityLevels[2]);
console.log('初始状态：');
printState(state3);
console.log('');

// 测试1：堆叠箱子推动
console.log('=== Test: 堆叠箱子推动 ===');
const stackedLevel = {
  grid: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ] as any[][],
  bluePlayer: { x: 1, y: 4 },
  redPlayer: { x: 5, y: 5 },
  boxes: [
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
  ],
  targets: [
    { x: 5, y: 5 },
    { x: 1, y: 5 },
  ],
};
let sStacked = createDuoGravityGameState(stackedLevel);
console.log('初始状态（3个堆叠的箱子）：');
printState(sStacked);
console.log('蓝方向右推堆叠的箱子：');
const before = sStacked;
sStacked = moveDuoGravityPlayer(sStacked, 'blue', 'right');
console.log(sStacked !== before ? '✓ 推动成功' : '✗ 推动失败');
printState(sStacked);
console.log('');

// 测试2：攀登箱子
console.log('=== Test: 攀登箱子 ===');
const climbLevel = {
  grid: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ] as any[][],
  bluePlayer: { x: 1, y: 5 },
  redPlayer: { x: 5, y: 5 },
  boxes: [
    { x: 2, y: 5 },
  ],
  targets: [
    { x: 3, y: 4 },
    { x: 5, y: 5 },
  ],
};
let sClimb = createDuoGravityGameState(climbLevel);
console.log('初始状态（玩家旁边有一个箱子）：');
printState(sClimb);
console.log('蓝方向右移动（会推箱子还是爬上去？）：');
sClimb = moveDuoGravityPlayer(sClimb, 'blue', 'right');
printState(sClimb);
console.log('');

// 测试3：推3个水平箱子（应该失败）
console.log('=== Test: 推3个水平箱子（应失败） ===');
const threeBoxLevel = {
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ] as any[][],
  bluePlayer: { x: 1, y: 5 },
  redPlayer: { x: 7, y: 5 },
  boxes: [
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
  ],
  targets: [
    { x: 7, y: 5 },
    { x: 1, y: 5 },
  ],
};
let s3 = createDuoGravityGameState(threeBoxLevel);
console.log('初始状态（3个水平箱子）：');
printState(s3);
console.log('蓝方向右推（应失败）：');
const s3before = s3;
s3 = moveDuoGravityPlayer(s3, 'blue', 'right');
console.log(s3 === s3before ? '✓ 正确，无法推动3个箱子' : '✗ 错误，推动了3个箱子');
printState(s3);
console.log('');

console.log('=== All tests completed ===');
