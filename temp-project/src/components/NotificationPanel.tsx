import { X, Battery, Wrench, Route, Calendar } from 'lucide-react';
import type { AppNotification } from '../data/mockData';

interface NotificationPanelProps {
  onClose: () => void;
}

const getIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'battery':
      return Battery;
    case 'maintenance':
      return Wrench;
    case 'route':
      return Route;
    default:
      return Calendar;
  }
};

const getColor = (type: AppNotification['type']) => {
  switch (type) {
    case 'battery':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    case 'maintenance':
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    case 'route':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    default:
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  }
};

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = [
    {
      id: '1',
      type: 'battery' as const,
      title: '电池电量提醒',
      message: '当前电池电量 78%，预计可行驶 50 公里',
      timestamp: '2024-05-10 14:25:00',
      read: false,
    },
    {
      id: '2',
      type: 'maintenance' as const,
      title: '维护提醒',
      message: '轮胎压力需要检查，请尽快处理',
      timestamp: '2024-05-10 13:15:00',
      read: false,
    },
    {
      id: '3',
      type: 'route' as const,
      title: 'AI 推荐路线',
      message: '为您推荐一条环保路线，节省 2.5kg CO₂',
      timestamp: '2024-05-10 12:00:00',
      read: true,
    },
  ];

  return (
    <div className="absolute right-6 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">通知中心</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          return (
            <div
              key={notification.id}
              className={`flex gap-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColor(notification.type)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
          查看全部通知
        </button>
      </div>
    </div>
  );
}
