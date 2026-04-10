import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  SB_Scholarship,
  SB_ScholarshipApplication,
  ScholarshipApplicationStatus,
  ScholarshipRequirement,
  ScholarshipRequirementStatus,
  UserDocument,
} from '../../../shared/models/scholarshipsModel';

import {
  fetchGetAllScholarships,
  fetchGetScholarshipById,
  fetchGetScholarshipFullDetail,
  fetchCreateScholarshipApplication,
  fetchGetScholarshipApplicationsByProfileId,
  fetchGetScholarshipApplicationById,
  fetchIsUserAppliedToScholarship,
  fetchUpdateScholarshipApplicationStatus,
  fetchSubmitScholarshipApplication,
  fetchWithdrawScholarshipApplication,
  fetchGetScholarshipApplicationCountByStatus,
  fetchGetScholarshipRequirements,
  fetchGetUserDocumentsForScholarship,
  fetchMatchRequirementsWithDocuments,
  fetchCreateScholarshipApplicationWithDocuments,
  fetchConfirmScholarshipApplicationWithDocuments,
  fetchGetScholarshipApplicationDocuments,
} from './thunk';

export interface ScholarshipState {
  scholarships: SB_Scholarship[];
  selectedScholarship: SB_Scholarship | null;
  selectedScholarshipDetail: any | null;

  applications: SB_ScholarshipApplication[];
  selectedApplication: SB_ScholarshipApplication | null;
  applicationCountByStatus: Record<ScholarshipApplicationStatus, number> | null;
  isUserApplied: boolean;
  createdApplicationId: string | null;

  requirements: ScholarshipRequirement[];
  userDocuments: UserDocument[];
  requirementStatuses: ScholarshipRequirementStatus[];
  applicationDocuments: Array<{
    id: string;
    application_id: string;
    enrollment_requirement_id: string;
    document_id: string | null;
    document_path: string | null;
    uploaded_at: string | null;
  }>;

  status: 'idle' | 'pending' | 'success' | 'failed';
  applicationStatus: 'idle' | 'pending' | 'success' | 'failed';
  requirementStatus: 'idle' | 'pending' | 'success' | 'failed';
  error: string | null;
}

const initialState: ScholarshipState = {
  scholarships: [],
  selectedScholarship: null,
  selectedScholarshipDetail: null,

  applications: [],
  selectedApplication: null,
  applicationCountByStatus: null,
  isUserApplied: false,
  createdApplicationId: null,

  requirements: [],
  userDocuments: [],
  requirementStatuses: [],
  applicationDocuments: [],

  status: 'idle',
  applicationStatus: 'idle',
  requirementStatus: 'idle',
  error: null,
};

const scholarshipSlice = createSlice({
  name: 'scholarship',
  initialState,
  reducers: {
    clearSelectedScholarship: (state) => {
      state.selectedScholarship = null;
      state.selectedScholarshipDetail = null;
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null;
    },
    clearCreatedApplicationId: (state) => {
      state.createdApplicationId = null;
    },
    clearRequirementStatuses: (state) => {
      state.requirementStatuses = [];
      state.requirements = [];
      state.userDocuments = [];
    },
    resetScholarshipStatus: (state) => {
      state.status = 'idle';
      state.applicationStatus = 'idle';
      state.requirementStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchGetAllScholarships.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchGetAllScholarships.fulfilled, (state, action: PayloadAction<SB_Scholarship[]>) => {
        state.status = 'success';
        state.scholarships = action.payload;
      })
      .addCase(fetchGetAllScholarships.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? 'Error al obtener las becas.';
      })

      .addCase(fetchGetScholarshipById.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipById.fulfilled, (state, action: PayloadAction<SB_Scholarship>) => {
        state.status = 'success';
        state.selectedScholarship = action.payload;
      })
      .addCase(fetchGetScholarshipById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? 'Error al obtener la beca.';
      })

      .addCase(fetchGetScholarshipFullDetail.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipFullDetail.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'success';
        state.selectedScholarshipDetail = action.payload;
      })
      .addCase(fetchGetScholarshipFullDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? 'Error al obtener el detalle de la beca.';
      })

      .addCase(fetchCreateScholarshipApplication.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchCreateScholarshipApplication.fulfilled, (state, action: PayloadAction<SB_ScholarshipApplication>) => {
        state.applicationStatus = 'success';
        state.applications.push(action.payload);
        state.selectedApplication = action.payload;
        state.createdApplicationId = action.payload.id;
      })
      .addCase(fetchCreateScholarshipApplication.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al crear la aplicación de beca.';
      })

      .addCase(fetchGetScholarshipApplicationsByProfileId.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipApplicationsByProfileId.fulfilled, (state, action: PayloadAction<SB_ScholarshipApplication[]>) => {
        state.applicationStatus = 'success';
        state.applications = action.payload;
      })
      .addCase(fetchGetScholarshipApplicationsByProfileId.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al obtener las aplicaciones.';
      })

      .addCase(fetchGetScholarshipApplicationById.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipApplicationById.fulfilled, (state, action: PayloadAction<SB_ScholarshipApplication>) => {
        state.applicationStatus = 'success';
        state.selectedApplication = action.payload;
      })
      .addCase(fetchGetScholarshipApplicationById.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al obtener la aplicación.';
      })

      .addCase(fetchIsUserAppliedToScholarship.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchIsUserAppliedToScholarship.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.status = 'success';
        state.isUserApplied = action.payload;
      })
      .addCase(fetchIsUserAppliedToScholarship.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? 'Error al verificar la aplicación.';
      })

      .addCase(fetchUpdateScholarshipApplicationStatus.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchUpdateScholarshipApplicationStatus.fulfilled, (state, action: PayloadAction<SB_ScholarshipApplication>) => {
        state.applicationStatus = 'success';
        state.selectedApplication = action.payload;
        const idx = state.applications.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.applications[idx] = action.payload;
      })
      .addCase(fetchUpdateScholarshipApplicationStatus.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al actualizar el estado de la aplicación.';
      })

      .addCase(fetchSubmitScholarshipApplication.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchSubmitScholarshipApplication.fulfilled, (state, action: PayloadAction<SB_ScholarshipApplication>) => {
        state.applicationStatus = 'success';
        state.selectedApplication = action.payload;
        const idx = state.applications.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.applications[idx] = action.payload;
      })
      .addCase(fetchSubmitScholarshipApplication.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al enviar la aplicación.';
      })

      .addCase(fetchWithdrawScholarshipApplication.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchWithdrawScholarshipApplication.fulfilled, (state, action: PayloadAction<SB_ScholarshipApplication>) => {
        state.applicationStatus = 'success';
        state.selectedApplication = action.payload;
        const idx = state.applications.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.applications[idx] = action.payload;
      })
      .addCase(fetchWithdrawScholarshipApplication.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al retirar la aplicación.';
      })

      .addCase(fetchGetScholarshipApplicationCountByStatus.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipApplicationCountByStatus.fulfilled, (state, action: PayloadAction<Record<ScholarshipApplicationStatus, number>>) => {
        state.status = 'success';
        state.applicationCountByStatus = action.payload;
      })
      .addCase(fetchGetScholarshipApplicationCountByStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? 'Error al obtener el conteo de aplicaciones.';
      })

      .addCase(fetchGetScholarshipRequirements.pending, (state) => {
        state.requirementStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipRequirements.fulfilled, (state, action: PayloadAction<ScholarshipRequirement[]>) => {
        state.requirementStatus = 'success';
        state.requirements = action.payload;
      })
      .addCase(fetchGetScholarshipRequirements.rejected, (state, action) => {
        state.requirementStatus = 'failed';
        state.error = action.payload as string ?? 'Error al obtener los requisitos.';
      })

      .addCase(fetchGetUserDocumentsForScholarship.pending, (state) => {
        state.requirementStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchGetUserDocumentsForScholarship.fulfilled, (state, action: PayloadAction<UserDocument[]>) => {
        state.requirementStatus = 'success';
        state.userDocuments = action.payload;
      })
      .addCase(fetchGetUserDocumentsForScholarship.rejected, (state, action) => {
        state.requirementStatus = 'failed';
        state.error = action.payload as string ?? 'Error al obtener los documentos del usuario.';
      })

      .addCase(fetchMatchRequirementsWithDocuments.pending, (state) => {
        state.requirementStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchMatchRequirementsWithDocuments.fulfilled, (state, action: PayloadAction<ScholarshipRequirementStatus[]>) => {
        state.requirementStatus = 'success';
        state.requirementStatuses = action.payload;
      })
      .addCase(fetchMatchRequirementsWithDocuments.rejected, (state, action) => {
        state.requirementStatus = 'failed';
        state.error = action.payload as string ?? 'Error al cruzar requisitos con documentos.';
      })

      .addCase(fetchCreateScholarshipApplicationWithDocuments.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchCreateScholarshipApplicationWithDocuments.fulfilled, (state, action: PayloadAction<{ applicationId: string; success: boolean }>) => {
        state.applicationStatus = 'success';
        state.createdApplicationId = action.payload.applicationId;
      })
      .addCase(fetchCreateScholarshipApplicationWithDocuments.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al crear la aplicación con documentos.';
      })

      .addCase(fetchConfirmScholarshipApplicationWithDocuments.pending, (state) => {
        state.applicationStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchConfirmScholarshipApplicationWithDocuments.fulfilled, (state) => {
        state.applicationStatus = 'success';
      })
      .addCase(fetchConfirmScholarshipApplicationWithDocuments.rejected, (state, action) => {
        state.applicationStatus = 'failed';
        state.error = action.payload as string ?? 'Error al confirmar la aplicación con documentos.';
      })

      .addCase(fetchGetScholarshipApplicationDocuments.pending, (state) => {
        state.requirementStatus = 'pending';
        state.error = null;
      })
      .addCase(fetchGetScholarshipApplicationDocuments.fulfilled, (state, action) => {
        state.requirementStatus = 'success';
        state.applicationDocuments = action.payload;
      })
      .addCase(fetchGetScholarshipApplicationDocuments.rejected, (state, action) => {
        state.requirementStatus = 'failed';
        state.error = action.payload as string ?? 'Error al obtener los documentos de la aplicación.';
      });
  },
});

export const {
  clearSelectedScholarship,
  clearSelectedApplication,
  clearCreatedApplicationId,
  clearRequirementStatuses,
  resetScholarshipStatus,
} = scholarshipSlice.actions;

export default scholarshipSlice.reducer;