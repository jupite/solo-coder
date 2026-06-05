import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const levelId = params.id;
  const userId = (session.user as { id?: string }).id;

  try {
    const level = await prisma.duoGravityLevel.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    if (level.userId !== userId) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    return NextResponse.json({ level });
  } catch (error) {
    console.error('获取重力关卡失败:', error);
    return NextResponse.json({ error: '获取关卡失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const levelId = params.id;
  const userId = (session.user as { id?: string }).id;

  try {
    const existing = await prisma.duoGravityLevel.findUnique({
      where: { id: levelId },
    });

    if (!existing) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: '无权修改' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      gridData,
      bluePlayerX,
      bluePlayerY,
      redPlayerX,
      redPlayerY,
      boxes,
      targets,
      verified,
    } = body;

    const updated = await prisma.duoGravityLevel.update({
      where: { id: levelId },
      data: {
        name,
        gridData,
        bluePlayerX,
        bluePlayerY,
        redPlayerX,
        redPlayerY,
        boxes,
        targets,
        verified: verified === true,
      },
    });

    return NextResponse.json({ success: true, level: updated });
  } catch (error) {
    console.error('更新重力关卡失败:', error);
    return NextResponse.json({ error: '更新关卡失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const levelId = params.id;
  const userId = (session.user as { id?: string }).id;

  try {
    const existing = await prisma.duoGravityLevel.findUnique({
      where: { id: levelId },
    });

    if (!existing) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: '无权修改' }, { status: 403 });
    }

    const body = await request.json();
    const { published } = body;

    if (published !== undefined && !existing.verified) {
      return NextResponse.json({ error: '未验证的关卡不能发布' }, { status: 400 });
    }

    const updated = await prisma.duoGravityLevel.update({
      where: { id: levelId },
      data: {
        published: published !== undefined ? published : existing.published,
      },
    });

    return NextResponse.json({ success: true, level: updated });
  } catch (error) {
    console.error('更新重力关卡失败:', error);
    return NextResponse.json({ error: '更新关卡失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const levelId = params.id;
  const userId = (session.user as { id?: string }).id;

  try {
    const existing = await prisma.duoGravityLevel.findUnique({
      where: { id: levelId },
    });

    if (!existing) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: '无权删除' }, { status: 403 });
    }

    await prisma.duoGravityLevel.delete({
      where: { id: levelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除重力关卡失败:', error);
    return NextResponse.json({ error: '删除关卡失败' }, { status: 500 });
  }
}
