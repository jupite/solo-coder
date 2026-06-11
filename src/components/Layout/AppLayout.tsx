import { Outlet } from 'react-router-dom';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/useMobile';
import { useReaderStore } from '@/store/readerStore';
import { useLocation } from 'react-router-dom';

export default function AppLayout() {
  const { currentTheme } = useTheme();
  const isMobile = useMobile();
  const location = useLocation();
  const { toolbarVisible } = useReaderStore();
  const isReader = location.pathname === '/reader';

  return (
    <div 
      className="w-full h-full flex flex-col md:flex-row" 
      style={{ backgroundColor: currentTheme.background }}
    >
      {!isMobile && <ActivityBar />}
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Outlet />
        {isMobile && (
          <div
            className={`shrink-0 transition-transform duration-300 ${
              isReader && !toolbarVisible ? 'translate-y-full' : 'translate-y-0'
            }`}
          >
            <ActivityBar />
          </div>
        )}
        {isMobile && <Sidebar />}
      </div>
    </div>
  );
}
