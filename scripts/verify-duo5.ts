import { solveDuoLevel } from '../src/lib/game/duo-solver';
import { duoLevels } from '../src/lib/game/duo-levels';

console.log('Verifying Duo Level 5...');
const solution = solveDuoLevel(duoLevels[4], 300000);
if (solution) {
  console.log(`✓ Solved in ${solution.length} steps`);
} else {
  console.log('✗ NO SOLUTION');
}
