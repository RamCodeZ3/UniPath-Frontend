import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SB_ApplicationForAdmission, ApplicationCheckResult } from '../../shared/models/applicationModel';
import {
  fetchCreateApplication,
  fetchGetUserApplications,
  fetchCheckIfApplied,
} from './thunks';

export interface ApplicationState {
  applications: SB_ApplicationForAdmission[];
  userApplications: Record<string, boolean>; // universityId -> boolean (applied) - usando object en lugar de Map
  applyStatus: 'idle' | 'pending' | 'success' | 'failed';
  fetchStatus: 'idle' | 'pending' | 'success' | 'failed';
  checkStatus: 'idle' | 'pending' | 'success' | 'failed';
  error: string | null;
}

const initialState: ApplicationState = {
  applications: [],
  userApplications: {}, // objeto vacío en lugar de Map
  applyStatus: 'idle',
  fetchStatus: 'idle',
  checkStatus: 'idle',
  error: null,
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetApplyStatus: (state) => {
      state.applyStatus = 'idle';
      state.error = null;
    },
    setApplications: (state, action: PayloadAction<SB_ApplicationForAdmission[]>) => {
      state.applications = action.payload;
      // Actualizar el objeto de aplicaciones
      const newMap: Record<string, boolean> = {};
      action.payload.forEach((app) => {
        newMap[app.university_id] = true;
      });
      state.userApplications = newMap;
    },
    addApplication: (state, action: PayloadAction<SB_ApplicationForAdmission>) => {
      state.applications.push(action.payload);
      state.userApplications[action.payload.university_id] = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Crear aplicación
      .addCase(fetchCreateApplication.pending, (state) => {
        state.applyStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchCreateApplication.fulfilled, (state, action: PayloadAction<SB_ApplicationForAdmission>) => {
        state.applyStatus = 'success';
        state.applications.push(action.payload);
        state.userApplications[action.payload.university_id] = true;
      })
      .addCase(fetchCreateApplication.rejected, (state, action) => {
        state.applyStatus = 'failed';
        state.error = action.payload as string ?? 'Error al crear aplicación';
      })

      // Obtener aplicaciones del usuario
      .addCase(fetchGetUserApplications.pending, (state) => {
        state.fetchStatus = 'pending';
        state.error = null;
      })
      .addCase(
        fetchGetUserApplications.fulfilled,
        (state, action: PayloadAction<SB_ApplicationForAdmission[]>) => {
          state.fetchStatus = 'success';
          state.applications = action.payload;
          
          // Actualizar objeto de aplicaciones
          const newMap: Record<string, boolean> = {};
          action.payload.forEach((app) => {
            newMap[app.university_id] = true;
          });
          state.userApplications = newMap;
        }
      )
      .addCase(fetchGetUserApplications.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload as string ?? 'Error al obtener aplicaciones';
      })

      // Verificar si aplicó
      .addCase(fetchCheckIfApplied.pending, (state) => {
        state.checkStatus = 'pending';
        state.error = null;
      })
      .addCase(
        fetchCheckIfApplied.fulfilled,
        (state, action: PayloadAction<ApplicationCheckResult>) => {
          state.checkStatus = 'success';
          state.userApplications[action.payload.universityId] = action.payload.applied;
        }
      )
      .addCase(fetchCheckIfApplied.rejected, (state, action) => {
        state.checkStatus = 'failed';
        state.error = action.payload as string ?? 'Error al verificar aplicación';
      });
  },
});

export const { clearError, resetApplyStatus, setApplications, addApplication } = applicationSlice.actions;
export default applicationSlice.reducer;
