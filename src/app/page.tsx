import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Gamepad2, LogIn, UserPlus, Sparkles } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/levels');
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        <div className="glass-card gradient-border p-10 md:p-16 text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold font-[var(--font-orbitron)] glow-text text-white tracking-tight">
              3D 推箱子
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto">
              经典推箱子游戏的 3D 重制版，体验沉浸式解谜乐趣
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <LogIn className="w-5 h-5" />
              登录
            </Link>
            <Link
              href="/register"
              className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <UserPlus className="w-5 h-5" />
              注册
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="glass-card p-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">精美 3D 画面</span>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">流畅操控体验</span>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">全球排行榜</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
