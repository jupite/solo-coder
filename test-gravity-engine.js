const { CellType } = require('./src/lib/game/types');
const {
  createDuoGravityGameState,
  moveDuoGravityPlayer,
  checkDuoGravityWin,
} = require('./src/lib/game/duo-gravity-engine');

// 创建一个简单的测试关卡
const testLevel = {
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  bluePlayer: { x: 1, y: 5 },
  redPlayer: { x: 6, y: 5 },
  boxes: [],
  targets: [
    { x: 3, y: 6 },
    { x: 4, y: 6 },
  ],
};

console.log('=== 测试重力模式游戏引擎 ===\n');

try {
  console.log('1. 创建游戏状态...');
  const state = createDuoGravityGameState(testLevel);
  console.log('   游戏状态创建成功');
  console.log('   蓝色玩家位置:', state.bluePlayer.position);
  console.log('   红色玩家位置:', state.redPlayer.position);
  console.log('   当前轮次:', state.currentTurn);
  console.log('   步数:', state.steps);
  console.log('   是否胜利:', state.isWin);
  console.log('');

  console.log('2. 移动蓝色玩家向右...');
  const state2 = moveDuoGravityPlayer(state, 'blue', 'right');
  console.log('   移动后状态:');
  console.log('   蓝色玩家位置:', state2.bluePlayer.position);
  console.log('   红色玩家位置:', state2.redPlayer.position);
  console.log('   当前轮次:', state2.currentTurn);
  console.log('   步数:', state2.steps);
  console.log('   是否胜利:', state2.isWin);
  console.log('   state === state2:', state === state2);
  console.log('');

  console.log('3. 再次移动蓝色玩家向右（应该失败，因为轮次变了）...');
  const state3 = moveDuoGravityPlayer(state2, 'blue', 'right');
  console.log('   移动结果:');
  console.log('   蓝色玩家位置:', state3.bluePlayer.position);
  console.log('   当前轮次:', state3.currentTurn);
  console.log('   state2 === state3:', state2 === state3);
  console.log('');

  console.log('4. 移动红色玩家向左...');
  const state4 = moveDuoGravityPlayer(state2, 'red', 'left');
  console.log('   移动后状态:');
  console.log('   蓝色玩家位置:', state4.bluePlayer.position);
  console.log('   红色玩家位置:', state4.redPlayer.position);
  console.log('   当前轮次:', state4.currentTurn);
  console.log('   步数:', state4.steps);
  console.log('   state2 === state4:', state2 === state4);
  console.log('');

  console.log('5. 连续移动测试...');
  let currentState = state;
  for (let i = 0; i < 5; i++) {
    const player = currentState.currentTurn;
    const direction = player === 'blue' ? 'right' : 'left';
    currentState = moveDuoGravityPlayer(currentState, player, direction);
    console.log(`   第 ${i + 1} 步: ${player} 向${direction}移动`);
    console.log(`     蓝: (${currentState.bluePlayer.position.x}, ${currentState.bluePlayer.position.y})`);
    console.log(`     红: (${currentState.redPlayer.position.x}, ${currentState.redPlayer.position.y})`);
    console.log(`     当前轮次: ${currentState.currentTurn}`);
  }
  console.log('');

  console.log('6. 向上移动测试...');
  const stateUp = createDuoGravityGameState(testLevel);
  console.log('   初始蓝位置:', stateUp.bluePlayer.position);
  const stateUp2 = moveDuoGravityPlayer(stateUp, 'blue', 'up');
  console.log('   上移后蓝位置:', stateUp2.bluePlayer.position);
  const stateUp3 = moveDuoGravityPlayer(stateUp2, 'red', 'up');
  console.log('   红上移后红位置:', stateUp3.redPlayer.position);
  console.log('');

  console.log('=== 测试完成 ===');
} catch (e) {
  console.error('测试出错:', e);
  console.error(e.stack);
}
