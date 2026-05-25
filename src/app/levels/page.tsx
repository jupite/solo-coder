'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LevelCard } from '@/components/levels/LevelCard';
import { Loader2, LogIn, Crown, Grid3X3, Pencil } from 'lucide-react';

interface Level {
  id: number;
  name: string;
  width: number;
  height: number;
}

interface LevelWithRecord extends Level {
  bestTime?: number | null;
  bestSteps?: number | null;
}

export default function LevelsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [levels, setLevels] = useState<LevelWithRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    const fetchLevels = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/levels');
        if (!res.ok) {
          throw new Error('获取关卡失败');
        }
        const data = await res.json();
        if (!cancelled) {
          setLevels(data.levels || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLevels();
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-slate-300">加载中...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="relative min-h-screen px-4 py-10 md:py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-orbitron)] glow-text mb-2">
              选择关卡
            </h1>
            <p className="text-slate-400">挑战推箱子，刷新你的最佳记录</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">
                {session.user?.name || '玩家'}
              </span>
            </div>
            <Link
              href="/editor"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              创建关卡
            </Link>
            <Link
              href="/profile"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              个人中心
            </Link>
          </div>
        </div>

        {error && (
          <div className="glass-card p-6 mb-8 border-red-500/30">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {!error && levels.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-300 mb-4">暂无可用关卡</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              onClick={(id) => router.push(`/game/${id}`)}
            />
          ))}
        </div>

        {levels.length === 0 && !loading && (
          <div className="text-center mt-12">
            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              登录后开始游戏
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
