import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, gridData, playerX, playerY, boxes, targets } = body;

    if (!name || !gridData || typeof playerX !== 'number' || typeof playerY !== 'number' || !boxes || !targets) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
    }

    const level = await prisma.userLevel.create({
      data: {
        userId,
        name,
        gridData,
        playerX,
        playerY,
        boxes,
        targets,
        verified: true,
      },
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('保存关卡失败:', error);
    return NextResponse.json({ error: '保存关卡失败' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
    }

    const levels = await prisma.userLevel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        verified: true,
      },
    });

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('获取关卡失败:', error);
    return NextResponse.json({ error: '获取关卡失败' }, { status: 500 });
  }
}
