import { MapPin, Bike, Navigation, Clock } from 'lucide-react';
import Card from '../components/Card';
import { stations } from '../data/mockData';

export default function Map() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">附近站点</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">查看附近的充电站和可用的电动自行车</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
          <Navigation className="w-4 h-4" />
          开始导航
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="h-[500px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-800 relative">
            {/* Simulated Map */}
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Roads */}
                <path d="M 0 200 L 800 200" stroke="#cbd5e1" strokeWidth="8" />
                <path d="M 400 0 L 400 500" stroke="#cbd5e1" strokeWidth="8" />
                <path d="M 0 350 L 800 350" stroke="#cbd5e1" strokeWidth="6" />
                <path d="M 200 0 L 200 500" stroke="#cbd5e1" strokeWidth="6" />
                <path d="M 600 0 L 600 500" stroke="#cbd5e1" strokeWidth="6" />
              </svg>
            </div>

            {/* Station Markers */}
            {stations.map((station, index) => {
              const positions = [
                { x: 25, y: 25 },
                { x: 55, y: 35 },
                { x: 75, y: 20 },
                { x: 35, y: 60 },
                { x: 65, y: 70 },
              ];
              const pos = positions[index] || positions[0];
              
              return (
                <div
                  key={station.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      station.availableBikes > 5
                        ? 'bg-secondary-500'
                        : station.availableBikes > 2
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}>
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        <p className="font-medium">{station.name}</p>
                        <p className="text-gray-300">可用: {station.availableBikes}/{station.totalSlots}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Location Marker */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-primary-500 border-4 border-white shadow-lg animate-pulse-slow" />
                <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary-500 animate-ping opacity-30" />
              </div>
            </div>
          </div>
        </Card>

        {/* Station List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            附近站点 ({stations.length})
          </h3>
          {stations.map((station) => (
            <Card key={station.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    station.availableBikes > 5
                      ? 'bg-secondary-100 dark:bg-secondary-900/30'
                      : station.availableBikes > 2
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <Bike className={`w-5 h-5 ${
                      station.availableBikes > 5
                        ? 'text-secondary-600 dark:text-secondary-400'
                        : station.availableBikes > 2
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {station.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {station.distance} km
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        约 {Math.round(station.distance * 3)} 分钟
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    station.availableBikes > 5
                      ? 'text-secondary-600 dark:text-secondary-400'
                      : station.availableBikes > 2
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {station.availableBikes}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    可用
                  </p>
                </div>
              </div>
              
              {/* Availability Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>可用车辆</span>
                  <span>{station.availableBikes}/{station.totalSlots}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      station.availableBikes / station.totalSlots > 0.5
                        ? 'bg-secondary-500'
                        : station.availableBikes / station.totalSlots > 0.2
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(station.availableBikes / station.totalSlots) * 100}%` }}
                  />
                </div>
              </div>

              <button className="mt-3 w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                查看详情
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
