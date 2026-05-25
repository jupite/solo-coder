import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const records = await prisma.gameRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const levelNames = ['初级训练', '小试牛刀', '经典关卡'];

  const userLevelIds = records
    .map((r) => r.levelId)
    .filter((id) => {
      const numId = Number(id);
      return isNaN(numId) || numId > levelNames.length;
    });

  const userLevels = await prisma.userLevel.findMany({
    where: { id: { in: userLevelIds } },
    select: { id: true, name: true },
  });

  const userLevelNameMap = new Map(
    userLevels.map((l) => [l.id, l.name]),
  );

  const result = records.map((r) => {
    let levelName = `关卡 ${r.levelId}`;
    const numId = Number(r.levelId);
    if (!isNaN(numId) && numId >= 1 && numId <= levelNames.length) {
      levelName = levelNames[numId - 1];
    } else {
      levelName = userLevelNameMap.get(r.levelId) || levelName;
    }

    return {
      id: r.id,
      levelId: r.levelId,
      levelName,
      bestTime: r.bestTime,
      bestSteps: r.bestSteps,
      lastPlayed: r.lastPlayed,
      createdAt: r.createdAt,
    };
  });

  return NextResponse.json({ records: result });
}
