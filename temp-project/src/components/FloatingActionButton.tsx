import { useState } from 'react';
import { Plus, Bike, Route, AlertTriangle, X } from 'lucide-react';

interface ActionItem {
  id: string;
  icon: typeof Bike;
  label: string;
  color: string;
}

const actions: ActionItem[] = [
  { id: 'book', icon: Bike, label: '预订自行车', color: 'from-primary-500 to-primary-600' },
  { id: 'ride', icon: Route, label: '开始骑行', color: 'from-secondary-500 to-secondary-600' },
  { id: 'report', icon: AlertTriangle, label: '报告问题', color: 'from-orange-500 to-orange-600' },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className="flex items-center gap-3 group"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <span className="px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-gray-600 to-gray-700 rotate-45'
            : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:scale-105'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Overlay for closing */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
