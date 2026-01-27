/**
 * Stats Redux Slice
 * Manages real-time statistics and analytics data
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import type { StatsUpdatePayload } from 'src/services/socket';

import { createSlice } from '@reduxjs/toolkit';

export interface StatMetric {
  id: string;
  name: string;
  value: number;
  change?: number;
  changePercentage?: number;
  unit?: string;
  lastUpdated: string;
}

export interface AnalyticsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface StatsState {
  metrics: Record<string, StatMetric>;
  analytics: Record<string, AnalyticsData>;
  isLoading: boolean;
  lastUpdate: string | null;
}

const initialState: StatsState = {
  metrics: {},
  analytics: {},
  isLoading: false,
  lastUpdate: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    updateMetric: (state, action: PayloadAction<StatsUpdatePayload>) => {
      const { metric, value, change, changePercentage, timestamp } = action.payload;
      
      state.metrics[metric] = {
        id: metric,
        name: metric,
        value,
        change,
        changePercentage,
        lastUpdated: timestamp,
      };
      
      state.lastUpdate = timestamp;
    },
    setMetrics: (state, action: PayloadAction<Record<string, StatMetric>>) => {
      state.metrics = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    updateAnalytics: (state, action: PayloadAction<{ key: string; data: AnalyticsData }>) => {
      const { key, data } = action.payload;
      state.analytics[key] = data;
      state.lastUpdate = new Date().toISOString();
    },
    setAnalytics: (state, action: PayloadAction<Record<string, AnalyticsData>>) => {
      state.analytics = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    clearMetric: (state, action: PayloadAction<string>) => {
      delete state.metrics[action.payload];
    },
    clearAllMetrics: (state) => {
      state.metrics = {};
      state.analytics = {};
      state.lastUpdate = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  updateMetric,
  setMetrics,
  updateAnalytics,
  setAnalytics,
  clearMetric,
  clearAllMetrics,
  setLoading,
} = statsSlice.actions;

export default statsSlice.reducer;
