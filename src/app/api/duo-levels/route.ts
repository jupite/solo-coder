import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { duoLevels as hardcodedDuoLevels } from '@/lib/game/duo-levels';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;

  const records = userId
    ? await prisma.duoGameRecord.findMany({
        where: { userId },
        select: { levelId: true, bestTime: true, bestSteps: true },
      })
    : [];

  const recordMap = new Map(
    records.map((r: { levelId: string; bestTime: number | null; bestSteps: number | null }) => [
      r.levelId,
      { bestTime: r.bestTime, bestSteps: r.bestSteps },
    ]),
  );

  const levelNames = ['双人入门', '机关挑战', '合作闯关'];

  const officialLevels = hardcodedDuoLevels.map((_, idx) => {
    const id = idx + 1;
    const record = recordMap.get(String(id));
    return {
      id,
      name: levelNames[idx] || `双人关卡 #${id}`,
      width: hardcodedDuoLevels[idx].grid[0]?.length ?? 0,
      height: hardcodedDuoLevels[idx].grid.length,
      bestTime: record?.bestTime ?? null,
      bestSteps: record?.bestSteps ?? null,
      isOfficial: true,
    };
  });

  const publishedLevels = await prisma.duoLevel.findMany({
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      gridData,
      bluePlayerX,
      bluePlayerY,
      redPlayerX,
      redPlayerY,
      blueMaxSteps,
      redMaxSteps,
      boxes,
      targets,
      redGates,
      switches,
    } = body;

    if (
      !name ||
      !gridData ||
      typeof bluePlayerX !== 'number' ||
      typeof bluePlayerY !== 'number' ||
      typeof redPlayerX !== 'number' ||
      typeof redPlayerY !== 'number' ||
      !boxes ||
      !targets
    ) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
    }

    const level = await prisma.duoLevel.create({
      data: {
        userId,
        name,
        gridData,
        bluePlayerX,
        bluePlayerY,
        redPlayerX,
        redPlayerY,
        blueMaxSteps: blueMaxSteps ?? 20,
        redMaxSteps: redMaxSteps ?? 20,
        boxes,
        targets,
        redGates: redGates || '[]',
        switches: switches || '[]',
        verified: true,
      },
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('保存双人关卡失败:', error);
    return NextResponse.json({ error: '保存双人关卡失败' }, { status: 500 });
  }
}