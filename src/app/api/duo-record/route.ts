import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const recordSchema = z.object({
  levelId: z.union([z.string(), z.number()]).transform((v) => String(v)),
  time: z.number().positive(),
  steps: z.number().int().positive(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = recordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { levelId, time, steps } = parsed.data;
    const now = new Date();

    const existing = await prisma.duoGameRecord.findUnique({
      where: { userId_levelId: { userId, levelId } },
    });

    let isNewRecord = false;
    let bestTime = time;
    let bestSteps = steps;

    if (existing) {
      const newBestTime = existing.bestTime == null || time < existing.bestTime
        ? time
        : existing.bestTime;
      const newBestSteps = existing.bestSteps == null || steps < existing.bestSteps
        ? steps
        : existing.bestSteps;

      isNewRecord = newBestTime !== existing.bestTime;
      bestTime = newBestTime;
      bestSteps = newBestSteps;

      await prisma.duoGameRecord.update({
        where: { id: existing.id },
        data: {
          bestTime: newBestTime,
          bestSteps: newBestSteps,
          lastPlayed: now,
        },
      });
    } else {
      isNewRecord = true;
      await prisma.duoGameRecord.create({
        data: {
          userId,
          levelId,
          bestTime: time,
          bestSteps: steps,
          lastPlayed: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isNewRecord,
      bestTime,
      bestSteps,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}