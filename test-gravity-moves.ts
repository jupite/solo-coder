import { createDuoGravityGameState, moveDuoGravityPlayer } from './src/lib/game/duo-gravity-engine';
import { duoGravityLevels } from './src/lib/game/duo-gravity-levels';

console.log('=== Gravity Engine Comprehensive Test ===\n');

for (let levelIdx = 0; levelIdx < duoGravityLevels.length; levelIdx++) {
  console.log(`Level ${levelIdx + 1}: ${duoGravityLevels[levelIdx].name}`);
  console.log('='.repeat(40));
  
  const state = createDuoGravityGameState(duoGravityLevels[levelIdx]);
  console.log('Initial state:');
  console.log('  Blue:', state.bluePlayer.position);
  console.log('  Red:', state.redPlayer.position);
  console.log('  Boxes:', state.boxes);
  console.log('  Turn:', state.currentTurn);
  console.log('');
  
  let current = state;
  
  const testMoves = ['right', 'right', 'up', 'left', 'left', 'right', 'right'];
  for (let i = 0; i < testMoves.length; i++) {
    const move = testMoves[i] as any;
    const start = Date.now();
    const next = moveDuoGravityPlayer(current, current.currentTurn, move);
    const elapsed = Date.now() - start;
    
    if (next !== current) {
      console.log(`Move ${i + 1} ${move} (${current.currentTurn}): ${elapsed}ms`);
      console.log('  Blue:', next.bluePlayer.position, next.bluePlayer.onTarget ? '(on target)' : '');
      console.log('  Red:', next.redPlayer.position, next.redPlayer.onTarget ? '(on target)' : '');
      console.log('  Boxes:', next.boxes);
      console.log('  Next turn:', next.currentTurn);
      console.log('  Win:', next.isWin);
    } else {
      console.log(`Move ${i + 1} ${move}: invalid (${elapsed}ms)`);
    }
    console.log('');
    
    current = next;
    
    if (current.isWin) {
      console.log('WIN!');
      break;
    }
  }
  
  console.log('');
}

console.log('All tests completed!');
