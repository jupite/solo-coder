import { useState, useEffect } from 'react';
import {
  Battery,
  Gauge,
  MapPin,
  Activity,
  TrendingUp,
  Zap,
  Wind,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import Card from '../components/Card';
import DateRangeSelector from '../components/DateRangeSelector';
import { bikeApi } from '../services/bikeApi';
import type { BikeDetail, BikeHistoryRecord, BikeListItem } from '../types/bike';
import { formatDate, getDateRangeFromQuick } from '../utils/dateUtils';

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
  const today = new Date();
  const defaultRange = getDateRangeFromQuick(7, today);
  
  const [startDate, setStartDate] = useState<Date>(defaultRange.start);
  const [endDate, setEndDate] = useState<Date>(defaultRange.end);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('bike-001');
  
  const [bikeList, setBikeList] = useState<BikeListItem[]>([]);
  const [bikeDetail, setBikeDetail] = useState<BikeDetail | null>(null);
  const [historyData, setHistoryData] = useState<BikeHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    loadData();
  }, [selectedBikeId, startDate, endDate]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [listResponse, detailResponse, historyResponse] = await Promise.all([
        bikeApi.getBikeList(),
        bikeApi.getBikeDetail(selectedBikeId),
        bikeApi.getBikeHistory(selectedBikeId, startDate, endDate),
      ]);

      if (listResponse.success) {
        setBikeList(listResponse.data);
      }

      if (detailResponse.success) {
        setBikeDetail(detailResponse.data);
      }

      if (historyResponse.success) {
        setHistoryData(historyResponse.data);
      }
    } catch (err) {
      setError('加载数据失败，请重试');
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDistance = historyData.reduce((sum, record) => sum + record.distance, 0);
  const totalCo2Saved = historyData.reduce((sum, record) => sum + record.co2Saved, 0);
  const totalEnergySaved = historyData.reduce((sum, record) => sum + record.energySaved, 0);
  const avgSpeed = historyData.length > 0
    ? historyData.reduce((sum, record) => sum + record.averageSpeed, 0) / historyData.length
    : 0;

  const chartData = historyData.map((record) => ({
    date: record.date.slice(5),
    distance: record.distance,
    co2Saved: record.co2Saved,
    energySaved: record.energySaved,
  }));

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (isLoading && !bikeDetail) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            欢迎回来，张三！{bikeDetail ? `当前查看: ${bikeDetail.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {bikeList.length > 1 && (
            <select
              value={selectedBikeId}
              onChange={(e) => setSelectedBikeId(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {bikeList.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.name}
                </option>
              ))}
            </select>
          )}
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            bikeId={selectedBikeId}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Battery Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">电池电量</p>
              <p className={`text-3xl font-bold mt-2 ${bikeDetail ? getBatteryColor(bikeDetail.battery) : 'text-gray-400'}`}>
                {bikeDetail ? `${bikeDetail.battery}%` : '--'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                预计可行驶 {bikeDetail ? Math.round(bikeDetail.battery * 0.64) : '--'} 公里
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Battery className={`w-6 h-6 ${bikeDetail ? getBatteryColor(bikeDetail.battery) : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${bikeDetail ? getBatteryBg(bikeDetail.battery) : 'bg-gray-300'} rounded-full transition-all duration-500`}
                style={{ width: `${bikeDetail ? bikeDetail.battery : 0}%` }}
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
                {bikeDetail ? bikeDetail.speed : '--'} <span className="text-lg font-normal text-gray-500">km/h</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                时间段: {formatDate(startDate)} — {formatDate(endDate)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg ${
              bikeDetail && bikeDetail.isLocked
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              <Activity className="w-3 h-3" />
              {bikeDetail ? (bikeDetail.isLocked ? '已锁定' : '行驶中') : '--'}
            </span>
          </div>
        </Card>

        {/* Location Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">当前位置</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2 truncate">
                {bikeDetail ? bikeDetail.location : '--'}
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {daysDiff === 1 ? '今日里程' : `共${daysDiff}天里程`}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalDistance.toFixed(1)} <span className="text-lg font-normal text-gray-500">km</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                累计 {bikeDetail ? bikeDetail.totalDistance.toFixed(0) : '--'} km
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400">
            <TrendingUp className="w-4 h-4" />
            <span>较前一周期增长 12%</span>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                骑行数据
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(startDate)} — {formatDate(endDate)} 骑行里程统计
              </p>
            </div>
          </div>
          <div className="h-64 w-full min-w-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis
                    dataKey="date"
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
                  <Legend />
                  <Bar dataKey="distance" name="里程 (km)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </Card>

        {/* CO2 Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                环保贡献
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                CO₂ 减排和能源节省趋势
              </p>
            </div>
          </div>
          <div className="h-64 w-full min-w-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis
                    dataKey="date"
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="co2Saved"
                    name="CO₂ 减排 (kg)"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="energySaved"
                    name="能源节省 (kWh)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                暂无数据
              </div>
            )}
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {daysDiff === 1 ? '今日节省' : '共节省'}能源
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalEnergySaved.toFixed(1)} kWh
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {daysDiff === 1 ? '今日累计' : `${daysDiff} 天累计`}
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
                {avgSpeed.toFixed(1)} km/h
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {daysDiff === 1 ? '今日统计' : `${daysDiff} 天统计`}
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
                相当于种植 {Math.ceil(totalCo2Saved / 20)} 棵树
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
