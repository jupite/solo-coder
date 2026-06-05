import { generateSoloLevel, generateDuoLevel, formatLevelForTs, formatDuoLevelForTs } from '../src/lib/game/level-generator';
import { solveLevel } from '../src/lib/game/solver';
import { solveDuoLevel } from '../src/lib/game/duo-solver';
import { LevelData, DuoLevelData } from '../src/lib/game/types';
import * as fs from 'fs';
import * as path from 'path';

async function generateSoloLevels(): Promise<LevelData[]> {
  console.log('Generating solo levels...');
  const difficulties = [10, 20, 30, 40, 50];
  const levels: LevelData[] = [];
  
  for (const minSteps of difficulties) {
    console.log(`\nLooking for level with min ${minSteps} steps...`);
    const level = generateSoloLevel(minSteps, 500);
    
    if (level) {
      const solution = solveLevel(level, 500000);
      console.log(`✓ Found level! Solution length: ${solution?.length}`);
      levels.push(level);
    } else {
      console.log(`✗ Failed to generate level with ${minSteps} steps`);
      throw new Error(`Failed to generate level with ${minSteps} steps`);
    }
  }
  
  return levels;
}

async function generateDuoLevels(): Promise<DuoLevelData[]> {
  console.log('\nGenerating duo levels...');
  const difficulties = [10, 20, 30, 40, 50];
  const levels: DuoLevelData[] = [];
  
  for (const minSteps of difficulties) {
    console.log(`\nLooking for duo level with min ${minSteps} steps...`);
    const level = generateDuoLevel(minSteps, 500);
    
    if (level) {
      const solution = solveDuoLevel(level, 300000);
      console.log(`✓ Found duo level! Solution length: ${solution?.length}`);
      levels.push(level);
    } else {
      console.log(`✗ Failed to generate duo level with ${minSteps} steps`);
      throw new Error(`Failed to generate duo level with ${minSteps} steps`);
    }
  }
  
  return levels;
}

function writeSoloLevelsFile(levels: LevelData[]) {
  const content = `import { CellType, LevelData } from './types';

export const levels: LevelData[] = [
${levels.map(level => formatLevelForTs(level)).join(',\n')},
];

export function getLevel(index: number): LevelData {
  return levels[Math.max(0, Math.min(index, levels.length - 1))];
}
`;
  
  const filePath = path.join(__dirname, '../src/lib/game/levels.ts');
  fs.writeFileSync(filePath, content);
  console.log(`\n✓ Written ${levels.length} solo levels to ${filePath}`);
}

function writeDuoLevelsFile(levels: DuoLevelData[]) {
  const content = `import { CellType, DuoLevelData } from './types';

export const duoLevels: DuoLevelData[] = [
${levels.map(level => formatDuoLevelForTs(level)).join(',\n')},
];

export function getDuoLevel(index: number): DuoLevelData {
  return duoLevels[Math.max(0, Math.min(index, duoLevels.length - 1))];
}
`;
  
  const filePath = path.join(__dirname, '../src/lib/game/duo-levels.ts');
  fs.writeFileSync(filePath, content);
  console.log(`✓ Written ${levels.length} duo levels to ${filePath}`);
}

async function main() {
  try {
    const soloLevels = await generateSoloLevels();
    const duoLevels = await generateDuoLevels();
    
    writeSoloLevelsFile(soloLevels);
    writeDuoLevelsFile(duoLevels);
    
    console.log('\n✓ All levels generated successfully!');
  } catch (error) {
    console.error('\n✗ Error generating levels:', error);
    process.exit(1);
  }
}

main();
