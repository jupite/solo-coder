'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DuoLevelEditor } from '@/components/editor/DuoLevelEditor';
import { ArrowLeft, Loader2, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

function DuoEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [levelId, setLevelId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const id = searchParams.get('edit');
    setLevelId(id);
  }, [searchParams]);

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
    <main className="relative min-h-screen px-4 py-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/duo-levels')}
              className="btn-ghost inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-[var(--font-orbitron)] glow-text">
                  双人关卡编辑器
                </h1>
                <p className="text-sm text-slate-400">
                  {levelId ? '编辑已有' : '创建你自己的'}双人闯关关卡
                </p>
              </div>
            </div>
          </div>
        </div>

        <DuoLevelEditor editingLevelId={levelId} />
      </div>
    </main>
  );
}

export default function DuoEditorPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-slate-300">加载中...</p>
        </div>
      </main>
    }>
      <DuoEditorContent />
    </Suspense>
  );
}