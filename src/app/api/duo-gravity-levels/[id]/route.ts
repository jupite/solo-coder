import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDuoGravityLevel } from '@/lib/game/duo-gravity-levels';
import { CellType } from '@/lib/game/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const levelId = params.id;

  if (!isNaN(Number(levelId))) {
    const idx = parseInt(levelId, 10) - 1;
    try {
      const level = getDuoGravityLevel(idx);
      return NextResponse.json({
        id: levelId,
        name: `重力关卡 ${levelId}`,
        grid: level.grid,
        bluePlayer: level.bluePlayer,
        redPlayer: level.redPlayer,
        boxes: level.boxes,
        targets: level.targets,
        isOfficial: true,
      });
    } catch {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }
  }

  try {
    const level = await prisma.duoGravityLevel.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    const grid = JSON.parse(level.gridData);
    const boxes = JSON.parse(level.boxes);
    const targets = JSON.parse(level.targets);

    return NextResponse.json({
      id: level.id,
      name: level.name,
      grid,
      bluePlayer: { x: level.bluePlayerX, y: level.bluePlayerY },
      redPlayer: { x: level.redPlayerX, y: level.redPlayerY },
      boxes,
      targets,
      isOfficial: false,
    });
  } catch (error) {
    console.error('获取重力关卡失败:', error);
    return NextResponse.json({ error: '获取关卡失败' }, { status: 500 });
  }
}
