import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SkinProvider } from '@/components/game/SkinProvider';

export const metadata: Metadata = {
  title: '3D 推箱子',
  description: '经典推箱子游戏的 3D 重制版',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <SkinProvider>{children}</SkinProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
