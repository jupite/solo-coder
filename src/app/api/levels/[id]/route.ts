import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { levels as hardcodedLevels } from '@/lib/game/levels';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const numericId = Number(params.id);

  if (!isNaN(numericId) && numericId > 0 && numericId <= hardcodedLevels.length) {
    const level = hardcodedLevels[numericId - 1];
    const levelNames = ['初级训练', '小试牛刀', '经典关卡'];
    return NextResponse.json({
      id: numericId,
      name: levelNames[numericId - 1] || `关卡 #${numericId}`,
      grid: level.grid,
      player: level.player,
      boxes: level.boxes,
      targets: level.targets,
      isOfficial: true,
    });
  }

  const publishedLevel = await prisma.userLevel.findFirst({
    where: { id: params.id, published: true },
  });

  if (publishedLevel) {
    return NextResponse.json({
      id: publishedLevel.id,
      name: publishedLevel.name,
      grid: JSON.parse(publishedLevel.gridData),
      player: { x: publishedLevel.playerX, y: publishedLevel.playerY },
      boxes: JSON.parse(publishedLevel.boxes),
      targets: JSON.parse(publishedLevel.targets),
      isOfficial: false,
    });
  }

  return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
}
