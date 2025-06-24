import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bandsReducer from './slices/bandsSlice';
import rehearsalsReducer from './slices/rehearsalsSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bands: bandsReducer,
    rehearsals: rehearsalsReducer,
    ui: uiReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'auth/refreshToken'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.token', 'payload.refreshToken'],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.token', 
          'auth.refreshToken',
          'rehearsals.entities.startTime',
          'rehearsals.entities.endTime',
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;