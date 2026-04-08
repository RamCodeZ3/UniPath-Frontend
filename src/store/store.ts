import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import documeReducer from './document/documentSlice';
import universityReducer from './university/universitySlice';
import applicationReducer from './application/applicationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    document: documeReducer,
    university: universityReducer,
    application: applicationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;