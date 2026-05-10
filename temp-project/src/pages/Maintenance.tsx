import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Card from '../components/Card';
import { maintenances } from '../data/mockData';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return '高优先级';
    case 'medium':
      return '中优先级';
    case 'low':
      return '低优先级';
    default:
      return priority;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    case 'in-progress':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    case 'pending':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'in-progress':
      return '进行中';
    case 'pending':
      return '待处理';
    default:
      return status;
  }
};

export default function Maintenance() {
  const pendingCount = maintenances.filter((m) => m.status === 'pending').length;
  const inProgressCount = maintenances.filter((m) => m.status === 'in-progress').length;
  const completedCount = maintenances.filter((m) => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">维护中心</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理您的自行车维护任务</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />
          添加任务
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">待处理</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Wrench className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">进行中</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">已完成</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* High Priority Alert */}
      {maintenances.some((m) => m.priority === 'high') && (
        <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">高优先级维护提醒</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                您有 {maintenances.filter((m) => m.priority === 'high').length} 项高优先级的维护任务需要立即处理
              </p>
              <button className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                立即查看 →
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Maintenance Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          维护任务列表
        </h2>
        
        {maintenances.map((task) => (
          <Card key={task.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  task.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : task.status === 'in-progress'
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Wrench className={`w-6 h-6 ${
                      task.status === 'in-progress'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }`} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      截止日期: {task.dueDate}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.status !== 'completed' && (
                  <button className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                    {task.status === 'in-progress' ? '继续' : '开始'}
                  </button>
                )}
                <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Maintenance Tips */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary-500" />
          维护小贴士
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '电池保养',
              description: '避免过度放电，保持电池电量在20%-80%之间',
              icon: '🔋',
            },
            {
              title: '轮胎检查',
              description: '每周检查一次轮胎气压，确保骑行安全',
              icon: '🛞',
            },
            {
              title: '刹车系统',
              description: '每月检查刹车片磨损情况，及时更换',
              icon: '🛑',
            },
            {
              title: '链条润滑',
              description: '每100公里或每周润滑一次链条',
              icon: '⚙️',
            },
            {
              title: '清洁保养',
              description: '骑行后及时清洁，避免泥沙磨损',
              icon: '🧼',
            },
            {
              title: '定期检修',
              description: '每3个月进行一次全面检修',
              icon: '🔧',
            },
          ].map((tip, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {tip.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
