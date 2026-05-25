import { CellType, LevelData } from './types';

export const levels: LevelData[] = [
  {
    grid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 2],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [{ x: 2, y: 1 }],
    targets: [{ x: 2, y: 2 }],
  },
  {
    grid: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 2],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    targets: [
      { x: 3, y: 0 },
      { x: 3, y: 3 },
    ],
  },
  {
    grid: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2],
    ] as CellType[][],
    player: { x: 1, y: 1 },
    boxes: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    targets: [
      { x: 2, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 4 },
    ],
  },
];

export function getLevel(index: number): LevelData {
  return levels[Math.max(0, Math.min(index, levels.length - 1))];
}
