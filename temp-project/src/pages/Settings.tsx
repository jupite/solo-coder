import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import Card from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    battery: true,
    maintenance: true,
    route: true,
    marketing: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">自定义您的应用体验</p>
      </div>

      {/* Account Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            账户设置
          </h2>
        </div>

        <div className="space-y-1">
          {[
            { label: '个人资料', value: '张三' },
            { label: '电子邮箱', value: 'zhangsan@example.com' },
            { label: '手机号码', value: '138****8888' },
            { label: '密码', value: '••••••••' },
          ].map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">{item.value}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            外观设置
          </h2>
        </div>

        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-500" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">深色模式</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isDark ? '当前使用深色主题' : '当前使用浅色主题'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isDark ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  isDark ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-gray-900 dark:text-white">语言设置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">简体中文</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            通知设置
          </h2>
        </div>

        <div className="space-y-1">
          {[
            { key: 'battery' as const, label: '电池电量提醒', icon: '🔋' },
            { key: 'maintenance' as const, label: '维护提醒', icon: '🔧' },
            { key: 'route' as const, label: '路线推荐通知', icon: '🛣️' },
            { key: 'marketing' as const, label: '营销推送', icon: '📱' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-900 dark:text-white">{item.label}</span>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key]
                    ? 'bg-primary-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            安全设置
          </h2>
        </div>

        <div className="space-y-1">
          {[
            { label: '双重验证', value: '已启用' },
            { label: '登录设备管理', value: '' },
            { label: '应用锁', value: '已启用' },
          ].map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-gray-900 dark:text-white">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                    {item.value}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Support & About */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            帮助与关于
          </h2>
        </div>

        <div className="space-y-1">
          {[
            { label: '帮助中心' },
            { label: '常见问题' },
            { label: '联系客服' },
            { label: '关于我们', value: 'v1.0.0' },
          ].map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-gray-900 dark:text-white">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-gray-500 dark:text-gray-400">{item.value}</span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Logout Button */}
      <button className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" />
        退出登录
      </button>
    </div>
  );
}
