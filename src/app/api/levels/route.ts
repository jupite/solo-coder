import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { levels as hardcodedLevels } from '@/lib/game/levels';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;

  const records = userId
    ? await prisma.gameRecord.findMany({
        where: { userId },
        select: { levelId: true, bestTime: true, bestSteps: true },
      })
    : [];

  const recordMap = new Map(
    records.map((r) => [r.levelId, { bestTime: r.bestTime, bestSteps: r.bestSteps }]),
  );

  const levelNames = ['初级训练', '小试牛刀', '经典关卡'];

  const officialLevels = hardcodedLevels.map((_, idx) => {
    const id = idx + 1;
    const record = recordMap.get(String(id));
    return {
      id,
      name: levelNames[idx] || `关卡 #${id}`,
      width: hardcodedLevels[idx].grid[0]?.length ?? 0,
      height: hardcodedLevels[idx].grid.length,
      bestTime: record?.bestTime ?? null,
      bestSteps: record?.bestSteps ?? null,
      isOfficial: true,
    };
  });

  const publishedLevels = await prisma.userLevel.findMany({
    where: { published: true },
    select: {
      id: true,
      name: true,
      gridData: true,
      createdAt: true,
    },
  });

  const publishedLevelsData = publishedLevels.map((level) => {
    let width = 0;
    let height = 0;
    try {
      const grid = JSON.parse(level.gridData);
      width = grid[0]?.length ?? 0;
      height = grid.length;
    } catch {
      // ignore
    }
    const record = recordMap.get(level.id);
    return {
      id: level.id,
      name: level.name,
      width,
      height,
      bestTime: record?.bestTime ?? null,
      bestSteps: record?.bestSteps ?? null,
      isOfficial: false,
    };
  });

  return NextResponse.json({
    levels: [...officialLevels, ...publishedLevelsData],
  });
}
