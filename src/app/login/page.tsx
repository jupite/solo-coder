import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="glass-card gradient-border p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-[var(--font-orbitron)]">
              欢迎回来
            </h1>
            <p className="text-slate-400">登录你的账号继续游戏</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
