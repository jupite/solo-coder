export interface BikeListItem {
  id: string;
  name: string;
  model: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastActive: string;
  batteryLevel: number;
}

export interface BikeDetail {
  id: string;
  name: string;
  model: string;
  battery: number;
  speed: number;
  location: string;
  distance: number;
  lastUpdate: string;
  isLocked: boolean;
  purchaseDate: string;
  totalDistance: number;
}

export interface BikeHistoryRecord {
  id: string;
  bikeId: string;
  date: string;
  distance: number;
  averageSpeed: number;
  maxSpeed: number;
  batteryUsed: number;
  co2Saved: number;
  energySaved: number;
  duration: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
