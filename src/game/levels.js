export const levels = [
  {
    id: 1,
    name: '入门',
    description: '简单的4x4布局',
    difficulty: 1,
    layout: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1]
    ]
  },
  {
    id: 2,
    name: '十字',
    description: '十字形布局',
    difficulty: 2,
    layout: [
      [0, 1, 1, 0],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [0, 1, 1, 0]
    ]
  },
  {
    id: 3,
    name: '棋盘',
    description: '国际象棋棋盘布局',
    difficulty: 2,
    layout: [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1]
    ]
  },
  {
    id: 4,
    name: '金字塔',
    description: '金字塔形布局',
    difficulty: 3,
    layout: [
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 5,
    name: '爱心',
    description: '爱心形状布局',
    difficulty: 3,
    layout: [
      [0, 1, 1, 0, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0]
    ]
  },
  {
    id: 6,
    name: '迷宫',
    description: '迷宫式布局',
    difficulty: 4,
    layout: [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1],
      [1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1]
    ]
  }
];

export function getLevelById(id) {
  return levels.find(l => l.id === id) || levels[0];
}

export function getLevelBrickPositions(level) {
  const positions = [];
  const rows = level.layout.length;
  const cols = level.layout[0].length;

  const startX = -(cols - 1) * 1.2;
  const startZ = -(rows - 1) * 1.2;
  const yPos = 5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (level.layout[row][col] === 1) {
        positions.push({
          x: startX + col * 2.4,
          y: yPos,
          z: startZ + row * 2.4 - 2
        });
      }
    }
  }

  return positions;
}
