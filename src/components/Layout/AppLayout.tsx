import { Outlet } from 'react-router-dom';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import { useTheme } from '@/hooks/useTheme';

export default function AppLayout() {
  const { currentTheme } = useTheme();

  return (
    <div className="w-full h-full flex" style={{ backgroundColor: currentTheme.background }}>
      <ActivityBar />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
