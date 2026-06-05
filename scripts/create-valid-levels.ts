import { solveLevel } from '../src/lib/game/solver';
import { solveDuoLevel } from '../src/lib/game/duo-solver';
import { LevelData, DuoLevelData, CellType } from '../src/lib/game/types';
import * as fs from 'fs';
import * as path from 'path';

const soloLevels: LevelData[] = [
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
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [{ x: 3, y: 3 }, { x: 5, y: 3 }],
    targets: [{ x: 6, y: 1 }, { x: 6, y: 5 }],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [{ x: 3, y: 3 }, { x: 5, y: 3 }, { x: 7, y: 5 }],
    targets: [{ x: 7, y: 1 }, { x: 1, y: 7 }, { x: 7, y: 7 }],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [{ x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }],
    targets: [{ x: 8, y: 1 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 8 }],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [{ x: 3, y: 3 }, { x: 5, y: 3 }, { x: 7, y: 3 }, { x: 3, y: 6 }, { x: 7, y: 6 }],
    targets: [{ x: 9, y: 1 }, { x: 9, y: 3 }, { x: 9, y: 5 }, { x: 9, y: 7 }, { x: 9, y: 8 }],
  },
];

const duoLevels: DuoLevelData[] = [
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 40,
    redMaxSteps: 40,
    boxes: [],
    targets: [{ x: 5, y: 1 }, { x: 5, y: 5 }],
    redGates: [],
    switches: [],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 5 },
    blueMaxSteps: 50,
    redMaxSteps: 50,
    boxes: [{ x: 4, y: 3 }],
    targets: [{ x: 6, y: 1 }, { x: 6, y: 5 }],
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
    blueMaxSteps: 60,
    redMaxSteps: 60,
    boxes: [],
    targets: [{ x: 7, y: 1 }, { x: 7, y: 5 }],
    redGates: [{ x: 4, y: 3, switchId: 'gate-0' }],
    switches: [{ x: 1, y: 3, id: 'gate-0', gateId: 'gate-0' }],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 6 },
    blueMaxSteps: 70,
    redMaxSteps: 70,
    boxes: [{ x: 4, y: 4 }, { x: 5, y: 4 }],
    targets: [{ x: 8, y: 1 }, { x: 8, y: 6 }],
    redGates: [],
    switches: [],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    bluePlayer: { x: 1, y: 1 },
    redPlayer: { x: 1, y: 6 },
    blueMaxSteps: 80,
    redMaxSteps: 80,
    boxes: [{ x: 3, y: 3 }, { x: 7, y: 4 }],
    targets: [{ x: 9, y: 1 }, { x: 9, y: 6 }],
    redGates: [{ x: 5, y: 3, switchId: 'gate-0' }, { x: 5, y: 4, switchId: 'gate-0' }],
    switches: [{ x: 1, y: 4, id: 'gate-0', gateId: 'gate-0' }],
  },
];

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

function validateAndWriteLevels() {
  console.log('Validating solo levels...');
  const validSoloLevels: LevelData[] = [];
  for (let i = 0; i < soloLevels.length; i++) {
    const solution = solveLevel(soloLevels[i], 500000);
    if (solution) {
      console.log(`Level ${i + 1}: Solved in ${solution.length} steps`);
      validSoloLevels.push(soloLevels[i]);
    } else {
      console.log(`Level ${i + 1}: NO SOLUTION - Skipping`);
    }
  }

  console.log('\nValidating duo levels...');
  const validDuoLevels: DuoLevelData[] = [];
  for (let i = 0; i < duoLevels.length; i++) {
    const solution = solveDuoLevel(duoLevels[i], 500000);
    if (solution) {
      console.log(`Level ${i + 1}: Solved in ${solution.length} steps`);
      validDuoLevels.push(duoLevels[i]);
    } else {
      console.log(`Level ${i + 1}: NO SOLUTION - Skipping`);
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
    console.log(`\n✓ Written ${validSoloLevels.length} solo levels`);
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
    console.log(`✓ Written ${validDuoLevels.length} duo levels`);
  }

  console.log('\n✓ All valid levels have been written!');
}

validateAndWriteLevels();
