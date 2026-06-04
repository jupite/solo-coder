'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import {
  Gamepad2,
  Users,
  Crown,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  onClick: () => void;
}

function ModeCard({ icon, title, description, color, glowColor, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative glass-card gradient-border p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20 w-full"
    >
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white font-[var(--font-orbitron)] glow-text mb-2">
            {title}
          </h3>
          <p className="text-slate-400">{description}</p>
        </div>
      </div>
      <div className={`absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${glowColor}`} />
    </button>
  );
}

export default function LevelsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  if (!session) {
    return null;
  }

  return (
    <main className="relative min-h-screen px-4 py-10 md:py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-orbitron)] glow-text mb-2">
              选择模式
            </h1>
            <p className="text-slate-400">选择你喜欢的游戏模式开始挑战</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="glass-card px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">
                {session.user?.name || '玩家'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModeCard
            icon={<Gamepad2 className="w-8 h-8 text-white" />}
            title="单人推箱子"
            description="经典推箱子玩法，挑战你的智慧"
            color="bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/30"
            glowColor="shadow-indigo-500/20"
            onClick={() => router.push('/solo-levels')}
          />
          <ModeCard
            icon={<Users className="w-8 h-8 text-white" />}
            title="双人闯关"
            description="红蓝角色协作解谜，共同到达目标点"
            color="bg-gradient-to-br from-red-500 to-blue-500 shadow-red-500/30"
            glowColor="shadow-red-500/20"
            onClick={() => router.push('/duo-levels')}
          />
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.push('/profile')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            个人中心
          </button>
        </div>
      </div>
    </main>
  );
}