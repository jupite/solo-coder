import { useState } from 'react';
import {
  Bike,
  Battery,
  Gauge,
  MapPin,
  Lock,
  Unlock,
  Settings,
  History,
  Wrench,
  Signal,
} from 'lucide-react';
import Card from '../components/Card';
import { bikeStatus } from '../data/mockData';

const getBatteryColor = (level: number) => {
  if (level > 60) return 'text-secondary-500';
  if (level > 30) return 'text-yellow-500';
  return 'text-red-500';
};

const getBatteryBg = (level: number) => {
  if (level > 60) return 'bg-secondary-500';
  if (level > 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function MyBikes() {
  const [isLocked, setIsLocked] = useState(bikeStatus.isLocked);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">我的自行车</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的电动自行车</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
          <Bike className="w-4 h-4" />
          添加车辆
        </button>
      </div>

      {/* Main Bike Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bike Visualization */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                EcoRide Pro X1
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                车辆编号: ER-2024-001
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              isLocked
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isLocked ? '已锁定' : '未锁定'}
            </span>
          </div>

          {/* Bike Image Area */}
          <div className="h-64 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-6 flex items-center justify-center">
            <div className="text-center">
              <Bike className="w-32 h-32 text-primary-500 mx-auto animate-float" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                实时连接中...
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                isLocked
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
              }`}
            >
              {isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              <span className="text-sm font-medium">{isLocked ? '解锁' : '锁定'}</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              <Settings className="w-6 h-6" />
              <span className="text-sm font-medium">设置</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
              <History className="w-6 h-6" />
              <span className="text-sm font-medium">历史</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
              <Wrench className="w-6 h-6" />
              <span className="text-sm font-medium">维护</span>
            </button>
          </div>
        </Card>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Battery Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">电池状态</h3>
              <Battery className={`w-5 h-5 ${getBatteryColor(bikeStatus.battery)}`} />
            </div>
            <div className="text-center mb-4">
              <p className={`text-4xl font-bold ${getBatteryColor(bikeStatus.battery)}`}>
                {bikeStatus.battery}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                预计可行驶 50 公里
              </p>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBatteryBg(bikeStatus.battery)} rounded-full transition-all duration-500`}
                style={{ width: `${bikeStatus.battery}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">当前速度</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {bikeStatus.speed} km/h
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Signal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">连接状态</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">已连接</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">当前位置</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-xs">
                    {bikeStatus.location}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bike Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            车辆信息
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">品牌型号</span>
              <span className="font-medium text-gray-900 dark:text-white">EcoRide Pro X1</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">购买日期</span>
              <span className="font-medium text-gray-900 dark:text-white">2024年1月15日</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">累计里程</span>
              <span className="font-medium text-gray-900 dark:text-white">{bikeStatus.distance} km</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">电池容量</span>
              <span className="font-medium text-gray-900 dark:text-white">48V 20Ah</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500 dark:text-gray-400">最高时速</span>
              <span className="font-medium text-gray-900 dark:text-white">45 km/h</span>
            </div>
          </div>
        </Card>

        {/* Recent History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            最近骑行记录
          </h3>
          <div className="space-y-4">
            {[
              { date: '今天 14:30', distance: '12.5 km', duration: '45 分钟' },
              { date: '今天 09:15', distance: '8.2 km', duration: '30 分钟' },
              { date: '昨天 18:00', distance: '15.8 km', duration: '55 分钟' },
              { date: '昨天 08:45', distance: '10.3 km', duration: '38 分钟' },
            ].map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Bike className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{record.date}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{record.duration}</p>
                  </div>
                </div>
                <p className="font-semibold text-primary-600 dark:text-primary-400">
                  {record.distance}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
