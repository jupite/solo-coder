export interface BikeStatus {
  battery: number;
  speed: number;
  location: string;
  distance: number;
  lastUpdate: string;
  isLocked: boolean;
}

export interface Station {
  id: string;
  name: string;
  availableBikes: number;
  totalSlots: number;
  distance: number;
  latitude: number;
  longitude: number;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  co2Saved: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isRecommended: boolean;
}

export interface Maintenance {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface AppNotification {
  id: string;
  type: 'battery' | 'maintenance' | 'route' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const bikeStatus: BikeStatus = {
  battery: 78,
  speed: 24.5,
  location: '北京市朝阳区望京SOHO',
  distance: 156.8,
  lastUpdate: '2024-05-10 14:30:00',
  isLocked: false,
};

export const stations: Station[] = [
  { id: '1', name: '望京SOHO站', availableBikes: 8, totalSlots: 15, distance: 0.2, latitude: 40.002, longitude: 116.48 },
  { id: '2', name: '望京西园站', availableBikes: 12, totalSlots: 20, distance: 0.5, latitude: 40.005, longitude: 116.47 },
  { id: '3', name: '地铁望京站', availableBikes: 5, totalSlots: 18, distance: 0.8, latitude: 40.008, longitude: 116.485 },
  { id: '4', name: '望京大厦站', availableBikes: 3, totalSlots: 12, distance: 1.1, latitude: 40.01, longitude: 116.475 },
  { id: '5', name: '望京公园站', availableBikes: 15, totalSlots: 25, distance: 1.4, latitude: 39.995, longitude: 116.49 },
];

export const routes: Route[] = [
  {
    id: '1',
    name: '环保通勤路线',
    origin: '望京SOHO',
    destination: '国贸CBD',
    distance: 12.5,
    estimatedTime: 45,
    co2Saved: 2.5,
    difficulty: 'medium',
    isRecommended: true,
  },
  {
    id: '2',
    name: '休闲骑行路线',
    origin: '望京公园',
    destination: '奥林匹克公园',
    distance: 18.2,
    estimatedTime: 60,
    co2Saved: 3.8,
    difficulty: 'easy',
    isRecommended: true,
  },
  {
    id: '3',
    name: '快速通勤路线',
    origin: '望京SOHO',
    destination: '中关村',
    distance: 15.8,
    estimatedTime: 50,
    co2Saved: 3.2,
    difficulty: 'hard',
    isRecommended: false,
  },
];

export const maintenances: Maintenance[] = [
  {
    id: '1',
    title: '电池健康检查',
    description: '建议进行电池容量测试',
    priority: 'medium',
    dueDate: '2024-05-15',
    status: 'pending',
  },
  {
    id: '2',
    title: '轮胎压力检查',
    description: '前轮胎压过低，请及时充气',
    priority: 'high',
    dueDate: '2024-05-12',
    status: 'in-progress',
  },
  {
    id: '3',
    title: '刹车系统保养',
    description: '刹车片磨损检测',
    priority: 'low',
    dueDate: '2024-06-01',
    status: 'pending',
  },
];

export const notifications: AppNotification[] = [
  {
    id: '1',
    type: 'battery',
    title: '电池电量提醒',
    message: '当前电池电量 78%，预计可行驶 50 公里',
    timestamp: '2024-05-10 14:25:00',
    read: false,
  },
  {
    id: '2',
    type: 'maintenance',
    title: '维护提醒',
    message: '轮胎压力需要检查，请尽快处理',
    timestamp: '2024-05-10 13:15:00',
    read: false,
  },
  {
    id: '3',
    type: 'route',
    title: 'AI 推荐路线',
    message: '为您推荐一条环保路线，节省 2.5kg CO₂',
    timestamp: '2024-05-10 12:00:00',
    read: true,
  },
];

export const weeklyStats = [
  { day: '周一', distance: 18.5, co2Saved: 3.2 },
  { day: '周二', distance: 22.3, co2Saved: 3.9 },
  { day: '周三', distance: 15.8, co2Saved: 2.7 },
  { day: '周四', distance: 28.6, co2Saved: 4.8 },
  { day: '周五', distance: 19.2, co2Saved: 3.3 },
  { day: '周六', distance: 35.4, co2Saved: 6.1 },
  { day: '周日', distance: 12.1, co2Saved: 2.1 },
];

export const monthlyStats = [
  { month: '1月', distance: 320, co2Saved: 55 },
  { month: '2月', distance: 280, co2Saved: 48 },
  { month: '3月', distance: 420, co2Saved: 72 },
  { month: '4月', distance: 380, co2Saved: 65 },
  { month: '5月', distance: 450, co2Saved: 78 },
];
