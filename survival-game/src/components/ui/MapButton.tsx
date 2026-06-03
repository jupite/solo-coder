'use client'

import { useGameStore } from '@/store/gameStore'

export function MapButton() {
  const { toggleMap } = useGameStore()

  return (
    <button
      onClick={toggleMap}
      className="absolute bottom-4 right-4 w-16 h-16 bg-gray-900/80 rounded-lg flex items-center justify-center text-3xl hover:bg-gray-700/80 transition-colors border-2 border-gray-600"
      title="查看地图 (M)"
    >
      🗺️
    </button>
  )
}

export function MapOverlay() {
  const { showMap, toggleMap, playerPosition, resources, mapSize } = useGameStore()

  if (!showMap) return null

  const mapScale = 300 / mapSize

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={toggleMap}
    >
      <div
        className="bg-gray-900 rounded-xl p-6 border-4 border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-xl font-bold mb-4 text-center">🗺️ 世界地图</h2>
        <div
          className="relative bg-green-900/50 rounded-lg border-2 border-gray-600"
          style={{ width: 300, height: 300 }}
        >
          <div
            className="absolute bg-green-800 border border-green-600"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
            }}
          />

          {resources.map((resource) => (
            <div
              key={resource.id}
              className={`absolute w-2 h-2 rounded-full ${
                resource.type === 'wood'
                  ? 'bg-green-600'
                  : resource.type === 'stone'
                  ? 'bg-gray-500'
                  : resource.type === 'flint'
                  ? 'bg-orange-500'
                  : resource.type === 'twig'
                  ? 'bg-yellow-700'
                  : 'bg-green-400'
              }`}
              style={{
                left: `${(resource.position[0] / mapSize + 0.5) * 100}%`,
                top: `${(resource.position[2] / mapSize + 0.5) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={resource.type}
            />
          ))}

          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"
            style={{
              left: `${(playerPosition[0] / mapSize + 0.5) * 100}%`,
              top: `${(playerPosition[2] / mapSize + 0.5) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          <div
            className="absolute border-2 border-dashed border-red-500/50"
            style={{
              left: '5%',
              top: '5%',
              width: '90%',
              height: '90%',
            }}
          />
        </div>

        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-300">玩家</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="text-gray-300">树木</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span className="text-gray-300">岩石</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-300">燧石</span>
          </div>
        </div>

        <p className="text-gray-400 text-center mt-4 text-sm">
          点击地图外任意位置关闭
        </p>
      </div>
    </div>
  )
}
