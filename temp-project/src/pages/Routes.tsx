import { useState } from 'react';
import {
  Route,
  Sparkles,
  Navigation,
  Clock,
  MapPin,
  Leaf,
  Zap,
  ChevronRight,
  Star,
} from 'lucide-react';
import Card from '../components/Card';
import { routes as mockRoutes } from '../data/mockData';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    case 'hard':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '简单';
    case 'medium':
      return '中等';
    case 'hard':
      return '困难';
    default:
      return difficulty;
  }
};

export default function Routes() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">路线规划</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI 为您推荐最优环保路线</p>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <Card className="p-6 bg-gradient-to-r from-primary-500 to-accent-500 border-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">AI 智能路线推荐</h3>
            <p className="text-primary-100 mt-1">
              根据您的历史偏好和实时路况，为您规划最环保的骑行路线
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2">
            开始规划
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Recommended Routes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          推荐路线
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockRoutes.filter(r => r.isRecommended).map((route) => (
            <Card
              key={route.id}
              className={`p-6 cursor-pointer transition-all ${
                selectedRoute === route.id
                  ? 'ring-2 ring-primary-500'
                  : ''
              }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                    <Route className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {route.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 text-xs rounded-full">
                      <Sparkles className="w-3 h-3" />
                      AI 推荐
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                  {getDifficultyLabel(route.difficulty)}
                </span>
              </div>

              {/* Route Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{route.origin}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{route.destination}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Navigation className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {route.distance}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">公里</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {route.estimatedTime}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">分钟</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
                  <Leaf className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-secondary-600 dark:text-secondary-400">
                    {route.co2Saved}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">kg CO₂</p>
                </div>
              </div>

              {/* Action Button */}
              <button className="mt-4 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                开始导航
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* All Routes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          所有路线
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {mockRoutes.map((route) => (
            <Card key={route.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  route.isRecommended
                    ? 'gradient-secondary'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Route className={`w-6 h-6 ${
                    route.isRecommended ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {route.name}
                    </h3>
                    {route.isRecommended && (
                      <Sparkles className="w-4 h-4 text-secondary-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {route.origin} → {route.destination}
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {route.distance} km
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">距离</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {route.estimatedTime} 分
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">时间</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-secondary-600 dark:text-secondary-400">
                      {route.co2Saved} kg
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">减排</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                    {getDifficultyLabel(route.difficulty)}
                  </span>
                </div>

                <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Environmental Impact Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary-500" />
              环保成就
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              选择电动自行车出行，为地球做出贡献
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-3 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">234.5</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">kg CO₂ 减排</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-secondary mx-auto mb-3 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">156.8</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">kWh 节省</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-accent mx-auto mb-3 flex items-center justify-center">
              <Route className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">公里骑行</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500 mx-auto mb-3 flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">环保勋章</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
