'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Grid3X3,
  Clock,
  Footprints,
  Medal,
  Sparkles,
  Loader2,
} from 'lucide-react';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const levelId = Number(params.levelId);
  const { data: session, status } = useSession();

  const time = Number(searchParams.get('time') || '0');
  const steps = Number(searchParams.get('steps') || '0');
  const bestTime = Number(searchParams.get('bestTime') || String(time));
  const bestSteps = Number(searchParams.get('bestSteps') || String(steps));
  const isNewRecord = searchParams.get('isNewRecord') === 'true';

  const levelNames = ['初级训练', '小试牛刀', '经典关卡'];
  const levelName = levelNames[levelId - 1] || `关卡 #${levelId}`;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-slate-300">加载中...</p>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="glass-card gradient-border p-8 md:p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white font-[var(--font-orbitron)] glow-text mb-1">
              关卡完成！
            </h1>
            <p className="text-slate-400">{levelName}</p>
          </div>

          {isNewRecord && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">
                新纪录！
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">本次用时</span>
              </div>
              <p className="text-2xl font-bold text-white font-[var(--font-orbitron)]">
                {formatTime(time)}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Footprints className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">本次步数</span>
              </div>
              <p className="text-2xl font-bold text-white font-[var(--font-orbitron)]">
                {steps}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Medal className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-slate-400">最佳用时</span>
              </div>
              <p className="text-2xl font-bold text-white font-[var(--font-orbitron)]">
                {formatTime(bestTime)}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Medal className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">最佳步数</span>
              </div>
              <p className="text-2xl font-bold text-white font-[var(--font-orbitron)]">
                {bestSteps}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push(`/game/${levelId}`)}
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              再玩一次
            </button>
            <button
              onClick={() => router.push(`/game/${levelId + 1}`)}
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              下一关
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => router.push('/levels')}
            className="btn-ghost w-full inline-flex items-center justify-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            返回关卡选择
          </button>
        </div>
      </div>
    </main>
  );
}
