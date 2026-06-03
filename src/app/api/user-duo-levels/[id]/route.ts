import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
    }

    const level = await prisma.duoLevel.findUnique({
      where: { id: params.id, userId },
    });

    if (!level) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    return NextResponse.json({ level });
  } catch (error) {
    console.error('获取双人关卡失败:', error);
    return NextResponse.json({ error: '获取双人关卡失败' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
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
      verified,
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

    const existingLevel = await prisma.duoLevel.findUnique({
      where: { id: params.id, userId },
    });

    if (!existingLevel) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    const updatedData: any = {
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
    };

    if (typeof verified === 'boolean') {
      updatedData.verified = verified;
      if (!verified) {
        updatedData.published = false;
      }
    }

    const level = await prisma.duoLevel.update({
      where: { id: params.id, userId },
      data: updatedData,
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('更新双人关卡失败:', error);
    return NextResponse.json({ error: '更新双人关卡失败' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { published } = body;

    if (typeof published !== 'boolean') {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
    }

    const existingLevel = await prisma.duoLevel.findUnique({
      where: { id: params.id, userId },
    });

    if (!existingLevel) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    if (published && !existingLevel.verified) {
      return NextResponse.json({ error: '未验证的关卡不能发布' }, { status: 400 });
    }

    const level = await prisma.duoLevel.update({
      where: { id: params.id, userId },
      data: { published },
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('更新双人关卡发布状态失败:', error);
    return NextResponse.json({ error: '更新双人关卡发布状态失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
    }

    const existingLevel = await prisma.duoLevel.findUnique({
      where: { id: params.id, userId },
    });

    if (!existingLevel) {
      return NextResponse.json({ error: '关卡不存在' }, { status: 404 });
    }

    await prisma.duoLevel.delete({
      where: { id: params.id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除双人关卡失败:', error);
    return NextResponse.json({ error: '删除双人关卡失败' }, { status: 500 });
  }
}