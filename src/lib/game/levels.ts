import { CellType, LevelData } from './types';

export const levels: LevelData[] = [
  {
    grid: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 2, 1],
      [1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 2, y: 2 },
    boxes: [{ x: 3, y: 2 }],
    targets: [{ x: 3, y: 3 }],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 2, y: 2 },
    boxes: [
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
    targets: [
      { x: 4, y: 1 },
      { x: 4, y: 4 },
    ],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ] as CellType[][],
    player: { x: 2, y: 2 },
    boxes: [
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ],
    targets: [
      { x: 3, y: 1 },
      { x: 5, y: 4 },
      { x: 1, y: 5 },
    ],
  },
];

export function getLevel(index: number): LevelData {
  return levels[Math.max(0, Math.min(index, levels.length - 1))];
}
