import { createDuoGravityGameState } from './src/lib/game/duo-gravity-engine';
import { duoGravityLevels } from './src/lib/game/duo-gravity-levels';

console.log('Starting test...');
console.log('Number of levels:', duoGravityLevels.length);

for (let i = 0; i < duoGravityLevels.length; i++) {
  console.log(`\nTesting level ${i + 1}: ${duoGravityLevels[i].name}`);
  console.log('  Grid size:', duoGravityLevels[i].grid.length, 'x', duoGravityLevels[i].grid[0]?.length);
  console.log('  Boxes:', duoGravityLevels[i].boxes.length);
  console.log('  Targets:', duoGravityLevels[i].targets.length);
  console.log('  Blue player:', duoGravityLevels[i].bluePlayer);
  console.log('  Red player:', duoGravityLevels[i].redPlayer);
  
  const start = Date.now();
  try {
    const state = createDuoGravityGameState(duoGravityLevels[i]);
    const elapsed = Date.now() - start;
    console.log('  State created in', elapsed, 'ms');
    console.log('  Blue player final pos:', state.bluePlayer.position);
    console.log('  Red player final pos:', state.redPlayer.position);
    console.log('  Boxes final positions:', state.boxes);
    console.log('  Is win:', state.isWin);
    console.log('  Steps:', state.steps);
    console.log('  Current turn:', state.currentTurn);
    console.log('  History length:', state.history.length);
  } catch (e) {
    console.error('  ERROR:', e);
  }
}

console.log('\nAll tests completed!');
