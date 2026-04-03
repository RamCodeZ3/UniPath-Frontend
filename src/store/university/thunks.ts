import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllUniversities, getUniversityFullDetail } from "../../shared/services/universityService";
import {
  getAllUniversityOverviews,
  getUniversityOverviewById,
  createUniversityOverview,
  updateUniversityOverview,
  deleteUniversityOverview,
} from "../../shared/services/universityOverviewsService";
import type { SB_UniversityOverviews } from "../../shared/models/universityOverviewsModel";


export const fetchAllUniversitiesThunk = createAsyncThunk(
  "universities/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllUniversities();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUniversityFullDetailThunk = createAsyncThunk(
  "universities/fetchFullDetail",
  async (universityId: string, { rejectWithValue }) => {
    try {
      return await getUniversityFullDetail(universityId);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);


export const fetchAllUniversityOverviewsThunk = createAsyncThunk(
  "universityOverviews/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllUniversityOverviews();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUniversityOverviewByIdThunk = createAsyncThunk(
  "universityOverviews/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getUniversityOverviewById(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createUniversityOverviewThunk = createAsyncThunk(
  "universityOverviews/create",
  async (payload: Omit<SB_UniversityOverviews, "id">, { rejectWithValue }) => {
    try {
      return await createUniversityOverview(payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUniversityOverviewThunk = createAsyncThunk(
  "universityOverviews/update",
  async (
    { id, payload }: { id: number; payload: Partial<Omit<SB_UniversityOverviews, "id">> },
    { rejectWithValue }
  ) => {
    try {
      return await updateUniversityOverview(id, payload);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteUniversityOverviewThunk = createAsyncThunk(
  "universityOverviews/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteUniversityOverview(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);