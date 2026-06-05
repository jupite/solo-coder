import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { levelId, time, steps } = body;

    if (!levelId || time === undefined || steps === undefined) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const existing = await prisma.duoGravityGameRecord.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
    });

    let isNewRecord = false;
    let bestTime = time;
    let bestSteps = steps;

    if (existing) {
      bestTime = existing.bestTime !== null && existing.bestTime < time ? existing.bestTime : time;
      bestSteps = existing.bestSteps !== null && existing.bestSteps < steps ? existing.bestSteps : steps;
      isNewRecord = time < (existing.bestTime ?? Infinity) || steps < (existing.bestSteps ?? Infinity);

      await prisma.duoGravityGameRecord.update({
        where: {
          userId_levelId: {
            userId,
            levelId,
          },
        },
        data: {
          bestTime,
          bestSteps,
          lastPlayed: new Date(),
        },
      });
    } else {
      isNewRecord = true;
      await prisma.duoGravityGameRecord.create({
        data: {
          userId,
          levelId,
          bestTime: time,
          bestSteps: steps,
        },
      });
    }

    return NextResponse.json({
      success: true,
      bestTime,
      bestSteps,
      isNewRecord,
    });
  } catch (error) {
    console.error('提交重力关卡记录失败:', error);
    return NextResponse.json({ error: '提交记录失败' }, { status: 500 });
  }
}
