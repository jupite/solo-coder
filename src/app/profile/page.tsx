'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Loader2,
  LogOut,
  User,
  Trophy,
  Clock,
  Footprints,
  Grid3X3,
  Calendar,
  Gamepad2,
  Users,
} from 'lucide-react';

interface RecordEntry {
  levelId: number | string;
  levelName: string;
  bestTime?: number | null;
  bestSteps?: number | null;
  lastPlayed?: string | null;
}

interface DuoRecordEntry extends RecordEntry {}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [duoRecords, setDuoRecords] = useState<DuoRecordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'solo' | 'duo'>('solo');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const [soloRes, duoRes] = await Promise.all([
          fetch('/api/records'),
          fetch('/api/duo-records'),
        ]);

        if (!soloRes.ok) {
          throw new Error('获取记录失败');
        }
        if (!duoRes.ok) {
          throw new Error('获取双人记录失败');
        }

        const soloData = await soloRes.json();
        const duoData = await duoRes.json();

        if (!cancelled) {
          setRecords(soloData.records || []);
          setDuoRecords(duoData.records || []);
        }
      } catch {
        if (!cancelled) {
          setRecords([]);
          setDuoRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecords();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
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

  if (!session) return null;

  const completedCount = records.filter(
    (r) => r.bestTime != null || r.bestSteps != null
  ).length;

  const duoCompletedCount = duoRecords.filter(
    (r) => r.bestTime != null || r.bestSteps != null
  ).length;

  const currentRecords = activeTab === 'solo' ? records : duoRecords;
  const currentCompletedCount = activeTab === 'solo' ? completedCount : duoCompletedCount;

  return (
    <main className="relative min-h-screen px-4 py-10 md:py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="glass-card gradient-border p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-[var(--font-orbitron)]">
                  {session.user?.name || '玩家'}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/levels')}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                关卡
              </button>
              <button
                onClick={handleSignOut}
                className="btn-ghost inline-flex items-center gap-2 text-red-300 hover:text-red-200 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="glass-card p-4 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 mb-1">单人完成</p>
              <p className="text-xl font-bold text-white font-[var(--font-orbitron)]">
                {completedCount}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 mb-1">单人记录</p>
              <p className="text-xl font-bold text-white font-[var(--font-orbitron)]">
                {records.length}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <Users className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 mb-1">双人完成</p>
              <p className="text-xl font-bold text-white font-[var(--font-orbitron)]">
                {duoCompletedCount}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <Gamepad2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 mb-1">双人记录</p>
              <p className="text-xl font-bold text-white font-[var(--font-orbitron)]">
                {duoRecords.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              最佳成绩
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('solo')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${activeTab === 'solo'
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                单人
              </button>
              <button
                onClick={() => setActiveTab('duo')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${activeTab === 'duo'
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                双人
              </button>
            </div>
          </div>

          {currentRecords.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">
                {activeTab === 'solo' ? '暂无单人游戏记录' : '暂无双人游戏记录'}
              </p>
              <button
                onClick={() => router.push(activeTab === 'solo' ? '/solo-levels' : '/duo-levels')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                开始挑战
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="text-left py-3 px-2 font-medium">关卡</th>
                    <th className="text-left py-3 px-2 font-medium">名称</th>
                    <th className="text-right py-3 px-2 font-medium">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        最佳用时
                      </span>
                    </th>
                    <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Footprints className="w-3 h-3" />
                        最佳步数
                      </span>
                    </th>
                    <th className="text-right py-3 px-2 font-medium hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        最近挑战
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((r) => (
                    <tr
                      key={r.levelId}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center justify-center px-2 h-8 rounded-lg bg-white/5 text-white font-[var(--font-orbitron)] font-bold text-sm max-w-[80px] truncate" title={`${r.levelId}`}>
                          #{typeof r.levelId === 'number' ? r.levelId : r.levelId.slice(0, 5)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white font-medium">
                        {r.levelName}
                      </td>
                      <td className="py-3 px-2 text-right text-cyan-300 font-[var(--font-orbitron)]">
                        {r.bestTime != null ? formatTime(r.bestTime) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right text-purple-300 font-[var(--font-orbitron)] hidden sm:table-cell">
                        {r.bestSteps != null ? r.bestSteps : '-'}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400 hidden md:table-cell">
                        {formatDate(r.lastPlayed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}