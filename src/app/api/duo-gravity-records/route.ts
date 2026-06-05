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
    return NextResponse.json({ error: '用户信息错误' }, { status: 400 });
  }

  try {
    const records = await prisma.duoGravityGameRecord.findMany({
      where: { userId },
      orderBy: { lastPlayed: 'desc' },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('获取重力关卡记录失败:', error);
    return NextResponse.json({ error: '获取记录失败' }, { status: 500 });
  }
}
