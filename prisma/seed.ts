import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const levels = [
  {
    name: '入门',
    width: 5,
    height: 5,
    mapData: JSON.stringify({
      grid: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 2, 1],
        [1, 0, 4, 3, 1],
        [1, 2, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      player: { x: 2, y: 2 },
      boxes: [{ x: 3, y: 2 }],
      targets: [{ x: 1, y: 3 }, { x: 3, y: 1 }],
    }),
  },
  {
    name: '进阶',
    width: 6,
    height: 6,
    mapData: JSON.stringify({
      grid: [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 2, 1],
        [1, 0, 4, 0, 0, 1],
        [1, 0, 3, 3, 0, 1],
        [1, 2, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1],
      ],
      player: { x: 2, y: 2 },
      boxes: [
        { x: 2, y: 3 },
        { x: 3, y: 3 },
      ],
      targets: [
        { x: 4, y: 1 },
        { x: 1, y: 4 },
      ],
    }),
  },
  {
    name: '挑战',
    width: 7,
    height: 7,
    mapData: JSON.stringify({
      grid: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 2, 0, 0, 1],
        [1, 0, 4, 0, 0, 0, 1],
        [1, 0, 3, 3, 3, 0, 1],
        [1, 0, 0, 0, 0, 2, 1],
        [1, 2, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ],
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
    }),
  },
];

async function main() {
  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: levels.indexOf(level) + 1 },
      update: level,
      create: level,
    });
  }

  const hashed = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: '演示用户',
      email: 'demo@example.com',
      passwordHash: hashed,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
