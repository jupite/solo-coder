import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const levels = await prisma.duoLevel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        verified: true,
        published: true,
      },
    });

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('获取双人关卡失败:', error);
    return NextResponse.json({ error: '获取双人关卡失败' }, { status: 500 });
  }
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