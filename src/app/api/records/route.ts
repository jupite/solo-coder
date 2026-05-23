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
    orderBy: { levelId: 'asc' },
  });

  const levelNames = ['初级训练', '小试牛刀', '经典关卡'];

  const result = records.map((r) => ({
    id: r.id,
    levelId: r.levelId,
    levelName: levelNames[r.levelId - 1] || `关卡 #${r.levelId}`,
    bestTime: r.bestTime,
    bestSteps: r.bestSteps,
    lastPlayed: r.lastPlayed,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ records: result });
}
