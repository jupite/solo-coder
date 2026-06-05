import { createDuoGravityGameState, moveDuoGravityPlayer, checkDuoGravityWin } from './src/lib/game/duo-gravity-engine';
import { duoGravityLevels } from './src/lib/game/duo-gravity-levels';
import type { PlayerColor, Direction } from './src/lib/game/types';

function printState(state: any, title?: string) {
  if (title) console.log(`=== ${title} ===`);
  const rows = state.grid.length;
  const cols = state.grid[0].length;
  const grid: string[][] = [];
  
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      const cell = state.grid[y][x];
      if (cell === 1) {
        grid[y][x] = '#';
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
    const onTarget = state.bluePlayer.onTarget;
    grid[p.y][p.x] = onTarget ? '@' : 'b';
  }
  if (state.redPlayer) {
    const p = state.redPlayer.position;
    const onTarget = state.redPlayer.onTarget;
    grid[p.y][p.x] = onTarget ? '%' : 'r';
  }

  console.log('  ' + '01234567890123456789'.slice(0, cols));
  for (let y = 0; y < rows; y++) {
    const line = (y < 10 ? ' ' : '') + y + ' ' + grid[y].join('');
    console.log(line);
  }
  console.log(`Turn: ${state.currentTurn}, Steps: ${state.steps}, Win: ${state.isWin}`);
  console.log('---');
}

function runMoves(levelIndex: number, moves: { color: PlayerColor; dir: Direction }[], levelName: string) {
  console.log(`\n========== 关卡 ${levelIndex + 1}: ${levelName} ==========`);
  let state = createDuoGravityGameState(duoGravityLevels[levelIndex]);
  printState(state, '初始状态');

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const prevState = state;
    state = moveDuoGravityPlayer(state, move.color, move.dir);
    if (state === prevState) {
      console.log(`第 ${i + 1} 步: ${move.color} ${move.dir} - ✗ 移动失败`);
    } else {
      console.log(`第 ${i + 1} 步: ${move.color} ${move.dir} - ✓`);
    }
    if (state.isWin) {
      printState(state, '通关!');
      console.log('🎉🎉🎉 恭喜通关！');
      return true;
    }
  }

  printState(state, '最终状态');
  console.log(`未通关。Blue在目标: ${state.bluePlayer.onTarget}, Red在目标: ${state.redPlayer.onTarget}`);
  return false;
}

console.log('=== 双人重力模式 - 关卡通关测试 ===\n');

// ========== 关卡1：重力初识 ==========
// 解法：蓝方和红方分别推开箱子，走到中间目标点
const level1Moves: { color: PlayerColor; dir: Direction }[] = [];

// 蓝方向右走，推开箱子
for (let i = 0; i < 3; i++) {
  level1Moves.push({ color: 'blue', dir: 'right' });
  level1Moves.push({ color: 'red', dir: 'left' });
}

const level1Pass = runMoves(0, level1Moves, '重力初识');
console.log(`关卡1是否可通关: ${level1Pass ? '✓ 是' : '✗ 否'}`);

// ========== 关卡2：箱子阶梯 ==========
// 解法：推箱子到平台边，踩着箱子爬上去
const level2Moves: { color: PlayerColor; dir: Direction }[] = [];

// 蓝方推箱子向右到平台边 (x=3)
level2Moves.push({ color: 'blue', dir: 'right' }); // 推到x=3
// 现在蓝方在x=2，箱子在x=3
// 蓝方继续向右，会攀登到箱子上吗？
level2Moves.push({ color: 'red', dir: 'left' }); // 红方也推

// 继续推箱子
level2Moves.push({ color: 'blue', dir: 'right' });
level2Moves.push({ color: 'red', dir: 'left' });

const level2Pass = runMoves(1, level2Moves, '箱子阶梯');
console.log(`关卡2是否可通关: ${level2Pass ? '✓ 是' : '✗ 否'}`);

// ========== 关卡3：双箱推动 ==========
// 解法：推动2个水平箱子到目标点另一边
const level3Moves: { color: PlayerColor; dir: Direction }[] = [];

// 蓝方推2个箱子向右
for (let i = 0; i < 4; i++) {
  level3Moves.push({ color: 'blue', dir: 'right' });
  level3Moves.push({ color: 'red', dir: 'left' });
}

const level3Pass = runMoves(2, level3Moves, '双箱推动');
console.log(`关卡3是否可通关: ${level3Pass ? '✓ 是' : '✗ 否'}`);

// 总结
console.log('\n========== 总结 ==========');
console.log(`关卡1 (重力初识): ${level1Pass ? '✓ 可通关' : '✗ 不可通关'}`);
console.log(`关卡2 (箱子阶梯): ${level2Pass ? '✓ 可通关' : '✗ 不可通关'}`);
console.log(`关卡3 (双箱推动): ${level3Pass ? '✓ 可通关' : '✗ 不可通关'}`);
