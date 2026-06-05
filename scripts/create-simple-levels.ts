import { solveLevel } from '../src/lib/game/solver';
import { solveDuoLevel } from '../src/lib/game/duo-solver';
import { LevelData, DuoLevelData, CellType } from '../src/lib/game/types';
import * as fs from 'fs';
import * as path from 'path';

function createSoloLevels(): LevelData[] {
  return [
    {
      grid: [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      player: { x: 1, y: 1 },
      boxes: [{ x: 2, y: 2 }],
      targets: [{ x: 4, y: 4 }],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      player: { x: 1, y: 1 },
      boxes: [{ x: 3, y: 3 }],
      targets: [{ x: 5, y: 5 }],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      player: { x: 1, y: 3 },
      boxes: [{ x: 3, y: 2 }, { x: 3, y: 4 }],
      targets: [{ x: 5, y: 1 }, { x: 5, y: 5 }],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      player: { x: 1, y: 3 },
      boxes: [{ x: 2, y: 2 }, { x: 2, y: 5 }, { x: 5, y: 3 }],
      targets: [{ x: 6, y: 1 }, { x: 6, y: 4 }, { x: 6, y: 6 }],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      player: { x: 1, y: 4 },
      boxes: [{ x: 3, y: 3 }, { x: 3, y: 5 }, { x: 5, y: 3 }, { x: 5, y: 5 }],
      targets: [{ x: 7, y: 1 }, { x: 7, y: 3 }, { x: 7, y: 5 }, { x: 7, y: 7 }],
    },
  ];
}

function createDuoLevels(): DuoLevelData[] {
  return [
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      bluePlayer: { x: 1, y: 1 },
      redPlayer: { x: 1, y: 5 },
      blueMaxSteps: 30,
      redMaxSteps: 30,
      boxes: [],
      targets: [{ x: 5, y: 1 }, { x: 5, y: 5 }],
      redGates: [],
      switches: [],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      bluePlayer: { x: 1, y: 1 },
      redPlayer: { x: 1, y: 5 },
      blueMaxSteps: 40,
      redMaxSteps: 40,
      boxes: [],
      targets: [{ x: 6, y: 1 }, { x: 6, y: 5 }],
      redGates: [],
      switches: [],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      bluePlayer: { x: 1, y: 1 },
      redPlayer: { x: 1, y: 5 },
      blueMaxSteps: 50,
      redMaxSteps: 50,
      boxes: [{ x: 3, y: 3 }],
      targets: [{ x: 6, y: 1 }, { x: 6, y: 5 }],
      redGates: [],
      switches: [],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      bluePlayer: { x: 1, y: 1 },
      redPlayer: { x: 1, y: 5 },
      blueMaxSteps: 60,
      redMaxSteps: 60,
      boxes: [{ x: 3, y: 2 }, { x: 3, y: 4 }],
      targets: [{ x: 7, y: 1 }, { x: 7, y: 5 }],
      redGates: [],
      switches: [],
    },
    {
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ] as CellType[][],
      bluePlayer: { x: 1, y: 1 },
      redPlayer: { x: 1, y: 5 },
      blueMaxSteps: 70,
      redMaxSteps: 70,
      boxes: [],
      targets: [{ x: 7, y: 1 }, { x: 7, y: 5 }],
      redGates: [{ x: 4, y: 3, switchId: 'gate-0' }],
      switches: [{ x: 2, y: 3, id: 'gate-0', gateId: 'gate-0' }],
    },
  ];
}

function formatLevelForTs(level: LevelData): string {
  const gridStr = level.grid.map(row => `      [${row.join(', ')}],`).join('\n');
  const boxesStr = level.boxes.map(b => `      { x: ${b.x}, y: ${b.y} }`).join(',\n');
  const targetsStr = level.targets.map(t => `      { x: ${t.x}, y: ${t.y} }`).join(',\n');
  
  return `  {
    grid: [
${gridStr}
    ] as CellType[][],
    player: { x: ${level.player.x}, y: ${level.player.y} },
    boxes: [
${boxesStr},
    ],
    targets: [
${targetsStr},
    ],
  }`;
}

function formatDuoLevelForTs(level: DuoLevelData): string {
  const gridStr = level.grid.map(row => `      [${row.join(', ')}],`).join('\n');
  const boxesStr = level.boxes.map(b => `      { x: ${b.x}, y: ${b.y} }`).join(',\n');
  const targetsStr = level.targets.map(t => `      { x: ${t.x}, y: ${t.y} }`).join(',\n');
  const gatesStr = level.redGates.map(g => `      { x: ${g.x}, y: ${g.y}, switchId: '${g.switchId}' }`).join(',\n');
  const switchesStr = level.switches.map(s => `      { x: ${s.x}, y: ${s.y}, id: '${s.id}', gateId: '${s.gateId}' }`).join(',\n');
  
  return `  {
    grid: [
${gridStr}
    ] as CellType[][],
    bluePlayer: { x: ${level.bluePlayer.x}, y: ${level.bluePlayer.y} },
    redPlayer: { x: ${level.redPlayer.x}, y: ${level.redPlayer.y} },
    blueMaxSteps: ${level.blueMaxSteps},
    redMaxSteps: ${level.redMaxSteps},
    boxes: [
${boxesStr || ''}
    ],
    targets: [
${targetsStr},
    ],
    redGates: [
${gatesStr || ''}
    ],
    switches: [
${switchesStr || ''}
    ],
  }`;
}

function main() {
  console.log('Validating and creating levels...\n');
  
  const soloCandidates = createSoloLevels();
  const validSoloLevels: LevelData[] = [];
  
  console.log('Solo levels:');
  for (let i = 0; i < soloCandidates.length; i++) {
    const solution = solveLevel(soloCandidates[i], 500000);
    if (solution) {
      console.log(`  Level ${i + 1}: Solved in ${solution.length} steps`);
      validSoloLevels.push(soloCandidates[i]);
    } else {
      console.log(`  Level ${i + 1}: NO SOLUTION`);
    }
  }

  const duoCandidates = createDuoLevels();
  const validDuoLevels: DuoLevelData[] = [];
  
  console.log('\nDuo levels:');
  for (let i = 0; i < duoCandidates.length; i++) {
    const solution = solveDuoLevel(duoCandidates[i], 500000);
    if (solution) {
      console.log(`  Level ${i + 1}: Solved in ${solution.length} steps`);
      validDuoLevels.push(duoCandidates[i]);
    } else {
      console.log(`  Level ${i + 1}: NO SOLUTION`);
    }
  }

  if (validSoloLevels.length > 0) {
    const content = `import { CellType, LevelData } from './types';

export const levels: LevelData[] = [
${validSoloLevels.map(level => formatLevelForTs(level)).join(',\n')},
];

export function getLevel(index: number): LevelData {
  return levels[Math.max(0, Math.min(index, levels.length - 1))];
}
`;
    const filePath = path.join(__dirname, '../src/lib/game/levels.ts');
    fs.writeFileSync(filePath, content);
    console.log(`\n✓ Written ${validSoloLevels.length} solo levels to levels.ts`);
  }

  if (validDuoLevels.length > 0) {
    const content = `import { CellType, DuoLevelData } from './types';

export const duoLevels: DuoLevelData[] = [
${validDuoLevels.map(level => formatDuoLevelForTs(level)).join(',\n')},
];

export function getDuoLevel(index: number): DuoLevelData {
  return duoLevels[Math.max(0, Math.min(index, duoLevels.length - 1))];
}
`;
    const filePath = path.join(__dirname, '../src/lib/game/duo-levels.ts');
    fs.writeFileSync(filePath, content);
    console.log(`✓ Written ${validDuoLevels.length} duo levels to duo-levels.ts`);
  }

  console.log('\n✓ Done!');
}

main();
