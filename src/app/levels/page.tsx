'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LevelCard } from '@/components/levels/LevelCard';
import { Loader2, LogIn, Crown, Grid3X3, Pencil, Edit2, Trash2, Play, CheckCircle, AlertCircle, Globe, Globe2 } from 'lucide-react';

interface Level {
  id: number | string;
  name: string;
  width: number;
  height: number;
}

interface LevelWithRecord extends Level {
  bestTime?: number | null;
  bestSteps?: number | null;
  isOfficial?: boolean;
}

interface UserLevel {
  id: string;
  name: string;
  verified: boolean;
  published: boolean;
  createdAt: string;
}

export default function LevelsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [levels, setLevels] = useState<LevelWithRecord[]>([]);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [levelsRes, userLevelsRes] = await Promise.all([
          fetch('/api/levels'),
          fetch('/api/user-levels'),
        ]);

        if (!levelsRes.ok) {
          throw new Error('获取关卡失败');
        }
        if (!userLevelsRes.ok) {
          throw new Error('获取用户关卡失败');
        }

        const levelsData = await levelsRes.json();
        const userLevelsData = await userLevelsRes.json();

        if (!cancelled) {
          setLevels(levelsData.levels || []);
          setUserLevels(userLevelsData.levels || []);
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

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleDeleteUserLevel = async (id: string) => {
    if (!confirm('确定要删除这个关卡吗？')) return;
    try {
      const res = await fetch(`/api/user-levels/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('删除失败');
      }
      setUserLevels(userLevels.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleEditUserLevel = (id: string) => {
    router.push(`/editor?edit=${id}`);
  };

  const handlePlayUserLevel = (id: string) => {
    router.push(`/editor?edit=${id}`);
  };

  const handlePublishLevel = async (id: string, publish: boolean) => {
    try {
      setPublishingId(id);
      const res = await fetch(`/api/user-levels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '操作失败');
      }
      setUserLevels(userLevels.map((l) =>
        l.id === id ? { ...l, published: publish } : l
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setPublishingId(null);
    }
  };

  const handlePlayOfficialLevel = (id: number | string) => {
    router.push(`/game/${id}`);
  };

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

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 font-[var(--font-orbitron)]">
            公开关卡
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                onClick={handlePlayOfficialLevel}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4 font-[var(--font-orbitron)]">
            我的关卡
          </h2>
          {userLevels.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Grid3X3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">还没有创建任何关卡</p>
              <Link
                href="/editor"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                创建第一个关卡
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userLevels.map((level) => (
                <div
                  key={level.id}
                  className="glass-card gradient-border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {level.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {level.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            已验证
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                            <AlertCircle className="w-3 h-3" />
                            未验证
                          </span>
                        )}
                        {level.published && (
                          <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                            <Globe className="w-3 h-3" />
                            已公开
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(level.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePlayUserLevel(level.id)}
                      className="btn-primary flex-1 py-2 px-3 text-sm inline-flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      试玩
                    </button>
                    <button
                      onClick={() => handleEditUserLevel(level.id)}
                      className="btn-secondary py-2 px-3 text-sm inline-flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </button>
                    {level.verified && (
                      <button
                        onClick={() => handlePublishLevel(level.id, !level.published)}
                        disabled={publishingId === level.id}
                        className={`py-2 px-3 text-sm inline-flex items-center justify-center gap-1 transition-all ${
                          level.published
                            ? 'btn-ghost text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                            : 'btn-secondary border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                        } disabled:opacity-50`}
                      >
                        {level.published ? (
                          <Globe2 className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                        {level.published ? '取消公开' : '发布公开'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUserLevel(level.id)}
                      className="btn-ghost py-2 px-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
