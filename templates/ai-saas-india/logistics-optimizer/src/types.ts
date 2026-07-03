export interface DeliveryStop {
  id: string;
  address: string;
  label: string;
}

export interface RouteStop {
  stopNumber: number;
  address: string;
  distance: string;
  estimatedTime: string;
  instructions: string;
  trafficLevel: 'low' | 'medium' | 'high';
  coordinates?: { x: number; y: number };
}

export interface RouteResult {
  optimizedOrder: RouteStop[];
  totalDistance: string;
  totalTime: string;
  fuelCost: string;
  trafficScore: number;
  weatherImpact: string;
  festivalNote: string;
  savingsCompared: string;
}

export interface CityData {
  name: string;
  state: string;
  trafficPeakHours: string;
  commonFestival: string;
  avgRainfall: string;
}
