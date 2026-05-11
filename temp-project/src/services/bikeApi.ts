import type { BikeListItem, BikeDetail, BikeHistoryRecord, ApiResponse } from '../types/bike';
import { formatDate, addDays, getDateRange } from '../utils/dateUtils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockBikes: BikeListItem[] = [
  {
    id: 'bike-001',
    name: 'EcoRide Pro X1',
    model: 'Pro X1',
    status: 'active',
    lastActive: '2024-05-10 14:30:00',
    batteryLevel: 78,
  },
  {
    id: 'bike-002',
    name: 'EcoRide Lite V2',
    model: 'Lite V2',
    status: 'active',
    lastActive: '2024-05-10 10:15:00',
    batteryLevel: 45,
  },
  {
    id: 'bike-003',
    name: 'EcoRide Sport S3',
    model: 'Sport S3',
    status: 'maintenance',
    lastActive: '2024-05-08 18:45:00',
    batteryLevel: 92,
  },
];

const generateHistoryData = (bikeId: string, startDate: Date, endDate: Date): BikeHistoryRecord[] => {
  const dateRange = getDateRange(startDate, endDate);
  
  return dateRange.map((dateStr, index) => {
    const baseDistance = 15 + Math.random() * 25;
    const baseBattery = 20 + Math.random() * 30;
    
    return {
      id: `history-${bikeId}-${index}`,
      bikeId,
      date: dateStr,
      distance: Number(baseDistance.toFixed(1)),
      averageSpeed: Number((18 + Math.random() * 8).toFixed(1)),
      maxSpeed: Number((28 + Math.random() * 12).toFixed(1)),
      batteryUsed: Number(baseBattery.toFixed(0)),
      co2Saved: Number((baseDistance * 0.18).toFixed(1)),
      energySaved: Number((baseDistance * 0.08).toFixed(1)),
      duration: Math.round((baseDistance / 20) * 60),
    };
  });
};

export const bikeApi = {
  async getBikeList(): Promise<ApiResponse<BikeListItem[]>> {
    await delay(300);
    return {
      success: true,
      data: mockBikes,
    };
  },

  async getBikeDetail(bikeId: string): Promise<ApiResponse<BikeDetail>> {
    await delay(200);
    
    const bike = mockBikes.find(b => b.id === bikeId);
    
    if (!bike) {
      return {
        success: false,
        data: null as unknown as BikeDetail,
        message: '车辆不存在',
      };
    }

    const detail: BikeDetail = {
      id: bike.id,
      name: bike.name,
      model: bike.model,
      battery: bike.batteryLevel,
      speed: bike.status === 'active' ? 24.5 : 0,
      location: '北京市朝阳区望京SOHO',
      distance: 156.8,
      lastUpdate: bike.lastActive,
      isLocked: bike.status !== 'active',
      purchaseDate: '2024-01-15',
      totalDistance: 1234.5,
    };

    return {
      success: true,
      data: detail,
    };
  },

  async getBikeHistory(
    bikeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ApiResponse<BikeHistoryRecord[]>> {
    await delay(400);

    const bike = mockBikes.find(b => b.id === bikeId);
    
    if (!bike) {
      return {
        success: false,
        data: [],
        message: '车辆不存在',
      };
    }

    const history = generateHistoryData(bikeId, startDate, endDate);

    return {
      success: true,
      data: history,
    };
  },
};

export const getDatesWithData = async (bikeId: string, year: number, month: number): Promise<string[]> => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const datesWithData: string[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(year, month, day));
    const hasData = Math.random() > 0.3;
    if (hasData) {
      datesWithData.push(dateStr);
    }
  }
  
  return datesWithData;
};
