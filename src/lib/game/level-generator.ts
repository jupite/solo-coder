import { CellType, Direction, LevelData, Position, DuoLevelData, PlayerColor, RedGate, SwitchItem } from './types';
import { solveLevel } from './solver';
import { solveDuoLevel } from './duo-solver';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createEmptyGrid(width: number, height: number): CellType[][] {
  const grid: CellType[][] = [];
  for (let y = 0; y < height; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push(CellType.WALL);
      } else {
        row.push(CellType.FLOOR);
      }
    }
    grid.push(row);
  }
  return grid;
}

function getRandomFloorPosition(grid: CellType[][], exclude: Position[] = []): Position | null {
  const floors: Position[] = [];
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      if (grid[y][x] === CellType.FLOOR) {
        const isExcluded = exclude.some(p => p.x === x && p.y === y);
        if (!isExcluded) {
          floors.push({ x, y });
        }
      }
    }
  }
  if (floors.length === 0) return null;
  return floors[Math.floor(Math.random() * floors.length)];
}

function addRandomWalls(grid: CellType[][], wallCount: number): CellType[][] {
  const newGrid = grid.map(row => [...row]);
  const floors: Position[] = [];
  
  for (let y = 2; y < newGrid.length - 2; y++) {
    for (let x = 2; x < newGrid[0].length - 2; x++) {
      if (newGrid[y][x] === CellType.FLOOR) {
        floors.push({ x, y });
      }
    }
  }
  
  const shuffled = shuffle(floors);
  for (let i = 0; i < Math.min(wallCount, shuffled.length); i++) {
    newGrid[shuffled[i].y][shuffled[i].x] = CellType.WALL;
  }
  
  return newGrid;
}

export function generateSoloLevel(
  minSteps: number,
  maxAttempts: number = 500
): LevelData | null {
  const boxCount = Math.min(6, Math.ceil(minSteps / 10) + 1);
  const width = Math.min(14, 8 + Math.floor(boxCount / 2));
  const height = Math.min(12, 7 + Math.floor(boxCount / 2));
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let grid = createEmptyGrid(width, height);
    grid = addRandomWalls(grid, Math.floor(width * height / 10));
    
    const player = getRandomFloorPosition(grid);
    if (!player) continue;
    
    const boxes: Position[] = [];
    const targets: Position[] = [];
    const occupied: Position[] = [player];
    
    let valid = true;
    for (let i = 0; i < boxCount; i++) {
      const box = getRandomFloorPosition(grid, occupied);
      if (!box) { valid = false; break; }
      boxes.push(box);
      occupied.push(box);
      
      const target = getRandomFloorPosition(grid, occupied);
      if (!target) { valid = false; break; }
      targets.push(target);
      occupied.push(target);
    }
    
    if (!valid) continue;
    
    const level: LevelData = { grid, player, boxes, targets };
    
    const solution = solveLevel(level, 500000);
    if (solution && solution.length >= minSteps && solution.length <= minSteps + 50) {
      console.log(`Found level with ${solution.length} steps (target: ${minSteps})`);
      return level;
    }
  }
  
  return null;
}

export function generateDuoLevel(
  minSteps: number,
  maxAttempts: number = 500
): DuoLevelData | null {
  const complexity = Math.ceil(minSteps / 12);
  const width = Math.min(14, 8 + complexity);
  const height = Math.min(12, 7 + complexity);
  const maxSteps = minSteps + 50;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let grid = createEmptyGrid(width, height);
    grid = addRandomWalls(grid, Math.floor(width * height / 12));
    
    const leftPositions: Position[] = [];
    const rightPositions: Position[] = [];
    
    for (let y = 1; y < height - 1; y++) {
      if (grid[y][1] === CellType.FLOOR) {
        leftPositions.push({ x: 1, y });
      }
      if (grid[y][width - 2] === CellType.FLOOR) {
        rightPositions.push({ x: width - 2, y });
      }
    }
    
    if (leftPositions.length < 2 || rightPositions.length < 2) continue;
    
    const shuffledLeft = shuffle(leftPositions);
    const shuffledRight = shuffle(rightPositions);
    
    const bluePlayer = shuffledLeft[0];
    const redPlayer = shuffledLeft[1];
    const target1 = shuffledRight[0];
    const target2 = shuffledRight[1];
    
    const targets = [target1, target2];
    const boxes: Position[] = [];
    const redGates: RedGate[] = [];
    const switches: SwitchItem[] = [];
    
    const occupied = [bluePlayer, redPlayer, target1, target2];
    
    if (complexity >= 2) {
      const boxCount = Math.min(3, complexity - 1);
      for (let i = 0; i < boxCount; i++) {
        const box = getRandomFloorPosition(grid, occupied);
        if (box) {
          boxes.push(box);
          occupied.push(box);
        }
      }
    }
    
    if (complexity >= 3) {
      const midX = Math.floor(width / 2);
      const gateY = Math.floor(height / 2);
      
      if (grid[gateY][midX] === CellType.FLOOR) {
        redGates.push({ x: midX, y: gateY, switchId: 'gate-0' });
        grid[gateY][midX] = CellType.WALL;
        
        const switchY = gateY + (Math.random() > 0.5 ? 1 : -1);
        if (switchY > 0 && switchY < height - 1 && grid[switchY][midX - 1] === CellType.FLOOR) {
          switches.push({ x: midX - 1, y: switchY, id: 'gate-0', gateId: 'gate-0' });
        }
      }
    }
    
    const level: DuoLevelData = {
      grid,
      bluePlayer,
      redPlayer,
      blueMaxSteps: maxSteps,
      redMaxSteps: maxSteps,
      boxes,
      targets,
      redGates,
      switches,
    };
    
    const solution = solveDuoLevel(level, 300000);
    if (solution && solution.length >= minSteps && solution.length <= minSteps + 50) {
      console.log(`Found duo level with ${solution.length} steps (target: ${minSteps})`);
      return level;
    }
  }
  
  return null;
}

export function formatLevelForTs(level: LevelData): string {
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

export function formatDuoLevelForTs(level: DuoLevelData): string {
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
