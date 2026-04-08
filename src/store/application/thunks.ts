import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createApplication,
  getApplicationsByProfileId,
  isUserAppliedToUniversity,
} from '../../shared/services/applicationService';
import type { ApplicationCheckResult } from '../../shared/models/applicationModel';

export const fetchCreateApplication = createAsyncThunk(
  'application/fetchCreateApplication',
  async (
    { profileId, universityId }: { profileId: string; universityId: string },
    { rejectWithValue }
  ) => {
    try {
      // Primero verificar que no haya aplicado
      const alreadyApplied = await isUserAppliedToUniversity(profileId, universityId);
      if (alreadyApplied) {
        return rejectWithValue('Ya has aplicado a esta universidad');
      }

      // Crear la aplicación
      const application = await createApplication(profileId, universityId);
      return application;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchGetUserApplications = createAsyncThunk(
  'application/fetchGetUserApplications',
  async (profileId: string, { rejectWithValue }) => {
    try {
      const applications = await getApplicationsByProfileId(profileId);
      return applications;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCheckIfApplied = createAsyncThunk(
  'application/fetchCheckIfApplied',
  async (
    { profileId, universityId }: { profileId: string; universityId: string }
  ) => {
    try {
      const applied = await isUserAppliedToUniversity(profileId, universityId);
      const result: ApplicationCheckResult = {
        universityId,
        applied,
      };
      return result;
    } catch (error) {
      // Silenciar el error y retornar que no ha aplicado (para permitir flujo)
      console.warn('[fetchCheckIfApplied] Error checking:', error);
      const result: ApplicationCheckResult = {
        universityId,
        applied: false,
      };
      return result;
    }
  }
);
