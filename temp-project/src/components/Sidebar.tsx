import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bike,
  Route,
  Wrench,
  Settings,
  Zap,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/bikes', icon: Bike, label: '我的自行车' },
  { path: '/routes', icon: Route, label: '路线' },
  { path: '/maintenance', icon: Wrench, label: '维护' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              EcoRide
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              智能电动自行车
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Stats Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">本月减排</span>
          </div>
          <div className="text-2xl font-bold">78.5 kg CO₂</div>
          <p className="text-xs text-primary-100 mt-1">
            相当于种植 4 棵树
          </p>
        </div>
      </div>
    </aside>
  );
}
