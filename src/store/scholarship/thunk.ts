import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  ScholarshipApplicationStatus,
  SB_ScholarshipApplication,
  ScholarshipRequirement,
  ScholarshipRequirementStatus,
  NewScholarshipDocumentToSave,
  UserDocument,
} from '../../shared/models/scholarshipsModel';
import type { SB_Scholarship } from '../../shared/models/scholarshipsModel';

import {
  getAllScholarshis,
  getScholarshiById,
  getScholarshipFullDetail,
} from '../../shared/services/scholarshipService';

import {
  createScholarshipApplication,
  getScholarshipApplicationsByProfileId,
  getScholarshipApplicationById,
  isUserAppliedToScholarship,
  updateScholarshipApplicationStatus,
  submitScholarshipApplication,
  withdrawScholarshipApplication,
  getScholarshipApplicationCountByStatus,
  getScholarshipRequirements,
  getUserDocuments,
  matchRequirementsWithDocuments,
  createScholarshipApplicationWithDocuments,
  confirmScholarshipApplicationWithDocuments,
  getScholarshipApplicationDocuments,
} from '../../shared/services/applicationScholarshipService';


export const fetchGetAllScholarships = createAsyncThunk<SB_Scholarship[], void>(
  'scholarship/fetchGetAllScholarships',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllScholarshis();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetScholarshipById = createAsyncThunk<SB_Scholarship, string>(
  'scholarship/fetchGetScholarshipById',
  async (scholarshipId, { rejectWithValue }) => {
    try {
      return await getScholarshiById(scholarshipId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetScholarshipFullDetail = createAsyncThunk<any, string>(
  'scholarship/fetchGetScholarshipFullDetail',
  async (scholarshipId, { rejectWithValue }) => {
    try {
      return await getScholarshipFullDetail(scholarshipId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchCreateScholarshipApplication = createAsyncThunk<
  SB_ScholarshipApplication,
  { profileId: string; scholarshipId: string }
>(
  'scholarship/fetchCreateScholarshipApplication',
  async ({ profileId, scholarshipId }, { rejectWithValue }) => {
    try {
      return await createScholarshipApplication(profileId, scholarshipId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetScholarshipApplicationsByProfileId = createAsyncThunk<
  SB_ScholarshipApplication[],
  string
>(
  'scholarship/fetchGetScholarshipApplicationsByProfileId',
  async (profileId, { rejectWithValue }) => {
    try {
      return await getScholarshipApplicationsByProfileId(profileId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetScholarshipApplicationById = createAsyncThunk<
  SB_ScholarshipApplication,
  string
>(
  'scholarship/fetchGetScholarshipApplicationById',
  async (applicationId, { rejectWithValue }) => {
    try {
      return await getScholarshipApplicationById(applicationId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIsUserAppliedToScholarship = createAsyncThunk<
  boolean,
  { profileId: string; scholarshipId: string }
>(
  'scholarship/fetchIsUserAppliedToScholarship',
  async ({ profileId, scholarshipId }, { rejectWithValue }) => {
    try {
      return await isUserAppliedToScholarship(profileId, scholarshipId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUpdateScholarshipApplicationStatus = createAsyncThunk<
  SB_ScholarshipApplication,
  { applicationId: string; status: ScholarshipApplicationStatus; reviewerNotes?: string }
>(
  'scholarship/fetchUpdateScholarshipApplicationStatus',
  async ({ applicationId, status, reviewerNotes }, { rejectWithValue }) => {
    try {
      return await updateScholarshipApplicationStatus(applicationId, status, reviewerNotes);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubmitScholarshipApplication = createAsyncThunk<
  SB_ScholarshipApplication,
  string
>(
  'scholarship/fetchSubmitScholarshipApplication',
  async (applicationId, { rejectWithValue }) => {
    try {
      return await submitScholarshipApplication(applicationId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWithdrawScholarshipApplication = createAsyncThunk<
  SB_ScholarshipApplication,
  string
>(
  'scholarship/fetchWithdrawScholarshipApplication',
  async (applicationId, { rejectWithValue }) => {
    try {
      return await withdrawScholarshipApplication(applicationId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetScholarshipApplicationCountByStatus = createAsyncThunk<
  Record<ScholarshipApplicationStatus, number>,
  string
>(
  'scholarship/fetchGetScholarshipApplicationCountByStatus',
  async (profileId, { rejectWithValue }) => {
    try {
      return await getScholarshipApplicationCountByStatus(profileId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchGetScholarshipRequirements = createAsyncThunk<
  ScholarshipRequirement[],
  string
>(
  'scholarship/fetchGetScholarshipRequirements',
  async (scholarshipId, { rejectWithValue }) => {
    try {
      return await getScholarshipRequirements(scholarshipId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetUserDocumentsForScholarship = createAsyncThunk<
  UserDocument[],
  string
>(
  'scholarship/fetchGetUserDocumentsForScholarship',
  async (profileId, { rejectWithValue }) => {
    try {
      return await getUserDocuments(profileId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMatchRequirementsWithDocuments = createAsyncThunk<
  ScholarshipRequirementStatus[],
  { requirements: ScholarshipRequirement[]; documents: UserDocument[] }
>(
  'scholarship/fetchMatchRequirementsWithDocuments',
  async ({ requirements, documents }, { rejectWithValue }) => {
    try {
      return matchRequirementsWithDocuments(requirements, documents);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCreateScholarshipApplicationWithDocuments = createAsyncThunk<
  { applicationId: string; success: boolean },
  {
    profileId: string;
    scholarshipId: string;
    documentsToLink: Array<{ document_id: string; enrollment_requirement_id: string }>;
  }
>(
  'scholarship/fetchCreateScholarshipApplicationWithDocuments',
  async ({ profileId, scholarshipId, documentsToLink }, { rejectWithValue }) => {
    try {
      return await createScholarshipApplicationWithDocuments(profileId, scholarshipId, documentsToLink);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConfirmScholarshipApplicationWithDocuments = createAsyncThunk<
  { success: boolean },
  {
    profileId: string;
    scholarshipId: string;
    newDocuments: NewScholarshipDocumentToSave[];
  }
>(
  'scholarship/fetchConfirmScholarshipApplicationWithDocuments',
  async ({ profileId, scholarshipId, newDocuments }, { rejectWithValue }) => {
    try {
      return await confirmScholarshipApplicationWithDocuments(profileId, scholarshipId, newDocuments);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGetScholarshipApplicationDocuments = createAsyncThunk<
  Array<{
    id: string;
    application_id: string;
    enrollment_requirement_id: string;
    document_id: string | null;
    document_path: string | null;
    uploaded_at: string | null;
  }>,
  string
>(
  'scholarship/fetchGetScholarshipApplicationDocuments',
  async (applicationId, { rejectWithValue }) => {
    try {
      return await getScholarshipApplicationDocuments(applicationId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);