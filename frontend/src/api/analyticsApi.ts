import apiClient from './apiClient';

export interface FinanceAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  totalRefunds: number;
  netProfit: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface DailyStatistic {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data: FinanceAnalytics;
}

export interface DailyStatisticsResponse {
  success: boolean;
  data: DailyStatistic[];
}

export const analyticsApi = {
  getFinance: async (startDate: string, endDate: string): Promise<FinanceAnalytics> => {
    const response = await apiClient.get<AnalyticsResponse>('/analytics/finance', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getDaily: async (startDate: string, endDate: string): Promise<DailyStatistic[]> => {
    const response = await apiClient.get<DailyStatisticsResponse>('/analytics/daily', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  exportExcel: async (startDate: string, endDate: string): Promise<Blob> => {
    const response = await apiClient.get('/analytics/export/excel', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },
};
