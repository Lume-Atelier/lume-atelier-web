/**
 * Types for Financial Analytics Dashboard
 * Mirrors backend DTOs: DailyRevenueDTO, FinancialAnalyticsDTO
 */

export interface DailyRevenue {
  date: string;
  revenue: number;
  salesCount: number;
}

export interface FinancialAnalytics {
  totalRevenue: number;
  averageTicket: number;
  salesCount: number;
  dailyRevenue: DailyRevenue[];
  periodStart: string;
  periodEnd: string;
}

export type DateRangePreset = 'last7days' | 'last30days' | 'thisMonth' | 'currentYear' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}
