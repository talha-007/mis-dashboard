/**
 * Redux Store Configuration
 * Main store setup with all reducers
 */

import type { TypedUseSelectorHook } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { setStoreDispatch } from 'src/services/api/axios-instance';

import uiReducer from './slices/ui.slice';
import authReducer from './slices/auth.slice';
import statsReducer from './slices/stats.slice';
import notificationsReducer from './slices/notifications.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    stats: statsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['socket/connect', 'socket/disconnect'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['socket.connection'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Set store dispatch for axios interceptor
setStoreDispatch(store.dispatch);
