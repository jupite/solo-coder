import { solveLevel } from '../src/lib/game/solver';
import { solveDuoLevel } from '../src/lib/game/duo-solver';
import { levels } from '../src/lib/game/levels';
import { duoLevels } from '../src/lib/game/duo-levels';

console.log('Verifying all levels...\n');

console.log('Solo Levels:');
for (let i = 0; i < levels.length; i++) {
  console.log(`  Level ${i + 1}: Solving...`);
  const solution = solveLevel(levels[i], 1000000);
  if (solution) {
    console.log(`    ✓ Solved in ${solution.length} steps`);
  } else {
    console.log(`    ✗ NO SOLUTION`);
  }
}

console.log('\nDuo Levels:');
for (let i = 0; i < duoLevels.length; i++) {
  console.log(`  Level ${i + 1}: Solving...`);
  const solution = solveDuoLevel(duoLevels[i], 500000);
  if (solution) {
    console.log(`    ✓ Solved in ${solution.length} steps`);
  } else {
    console.log(`    ✗ NO SOLUTION`);
  }
}

console.log('\n✓ Verification complete!');
