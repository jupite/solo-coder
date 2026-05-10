import {
  Battery,
  Gauge,
  MapPin,
  Activity,
  TrendingUp,
  Zap,
  Calendar,
  Wind,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../components/Card';
import { bikeStatus, weeklyStats, monthlyStats } from '../data/mockData';

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

export default function Dashboard() {
  const totalDistance = weeklyStats.reduce((sum, day) => sum + day.distance, 0);
  const totalCo2Saved = weeklyStats.reduce((sum, day) => sum + day.co2Saved, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">欢迎回来，张三！今天天气不错，适合骑行</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>2024年5月10日</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Battery Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">电池电量</p>
              <p className={`text-3xl font-bold mt-2 ${getBatteryColor(bikeStatus.battery)}`}>
                {bikeStatus.battery}%
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                预计可行驶 50 公里
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Battery className={`w-6 h-6 ${getBatteryColor(bikeStatus.battery)}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBatteryBg(bikeStatus.battery)} rounded-full transition-all duration-500`}
                style={{ width: `${bikeStatus.battery}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Speed Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">当前速度</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {bikeStatus.speed} <span className="text-lg font-normal text-gray-500">km/h</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                实时更新中
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-lg">
              <Activity className="w-3 h-3" />
              行驶中
            </span>
          </div>
        </Card>

        {/* Location Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">当前位置</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2 truncate">
                {bikeStatus.location}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                GPS 定位准确
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
              查看详细位置 →
            </button>
          </div>
        </Card>

        {/* Distance Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">本周里程</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalDistance.toFixed(1)} <span className="text-lg font-normal text-gray-500">km</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                累计 {bikeStatus.distance} km
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400">
            <TrendingUp className="w-4 h-4" />
            <span>较上周增长 12%</span>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Distance Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                本周骑行数据
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                每天骑行里程统计
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded-full bg-primary-500" />
                里程 (km)
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="day"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="distance" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly CO2 Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                碳减排趋势
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                每月 CO₂ 减排量 (kg)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded-full bg-secondary-500" />
                CO₂ 减排
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="co2Saved"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Energy Saved */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-secondary flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">节省能源</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                12.8 kWh
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                本周累计
              </p>
            </div>
          </div>
        </Card>

        {/* Average Speed */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
              <Wind className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">平均速度</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                21.5 km/h
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                本周统计
              </p>
            </div>
          </div>
        </Card>

        {/* CO2 Saved */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center">
              <LeafIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">减排 CO₂</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalCo2Saved.toFixed(1)} kg
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                相当于种植 1 棵树
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LeafIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
