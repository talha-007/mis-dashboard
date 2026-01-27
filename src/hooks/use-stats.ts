/**
 * useStats Hook
 * Custom hook for accessing real-time stats
 */

import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'src/store';
import { clearMetric, clearAllMetrics } from 'src/store/slices/stats.slice';

export const useStats = () => {
  const dispatch = useAppDispatch();
  const { metrics, analytics, isLoading, lastUpdate } = useAppSelector((state) => state.stats);

  const getMetric = useCallback(
    (metricName: string) => metrics[metricName] || null,
    [metrics]
  );

  const getAnalytics = useCallback(
    (key: string) => analytics[key] || null,
    [analytics]
  );

  const removeMetric = useCallback(
    (metricName: string) => {
      dispatch(clearMetric(metricName));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch(clearAllMetrics());
  }, [dispatch]);

  return {
    // State
    metrics,
    analytics,
    isLoading,
    lastUpdate,
    
    // Getters
    getMetric,
    getAnalytics,
    
    // Actions
    clearMetric: removeMetric,
    clearAllMetrics: clearAll,
  };
};
