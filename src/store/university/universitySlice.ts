import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SB_UniversityOverviews } from '../../shared/models/universityOverviewsModel';
import {
    fetchAllUniversitiesThunk,
    fetchUniversityFullDetailThunk,
    fetchAllUniversityOverviewsThunk,
    fetchUniversityOverviewByIdThunk,
    createUniversityOverviewThunk,
    updateUniversityOverviewThunk,
    deleteUniversityOverviewThunk,
} from './thunks';

export interface UniversityState {
    universities: any[];
    universityDetail: any | null;
    overviews: SB_UniversityOverviews[];
    selectedOverview: SB_UniversityOverviews | null;
    status: 'idle' | 'pending' | 'success' | 'failed';
    error: string | null;
}

const initialState: UniversityState = {
    universities: [],
    universityDetail: null,
    overviews: [],
    selectedOverview: null,
    status: 'idle',
    error: null,
};

const universitySlice = createSlice({
    name: 'university',
    initialState,
    reducers: {
        clearUniversityDetail: (state) => {
            state.universityDetail = null;
        },
        clearSelectedOverview: (state) => {
            state.selectedOverview = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUniversitiesThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchAllUniversitiesThunk.fulfilled, (state, action: PayloadAction<any[]>) => {
                state.status = 'success';
                state.universities = action.payload;
            })
            .addCase(fetchAllUniversitiesThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al obtener las universidades.';
            })

            .addCase(fetchUniversityFullDetailThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchUniversityFullDetailThunk.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'success';
                state.universityDetail = action.payload;
            })
            .addCase(fetchUniversityFullDetailThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al obtener el detalle de la universidad.';
            })

            .addCase(fetchAllUniversityOverviewsThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchAllUniversityOverviewsThunk.fulfilled, (state, action: PayloadAction<SB_UniversityOverviews[]>) => {
                state.status = 'success';
                state.overviews = action.payload;
            })
            .addCase(fetchAllUniversityOverviewsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al obtener los overviews.';
            })

            .addCase(fetchUniversityOverviewByIdThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchUniversityOverviewByIdThunk.fulfilled, (state, action: PayloadAction<SB_UniversityOverviews>) => {
                state.status = 'success';
                state.selectedOverview = action.payload;
            })
            .addCase(fetchUniversityOverviewByIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al obtener el overview.';
            })

            .addCase(createUniversityOverviewThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(createUniversityOverviewThunk.fulfilled, (state, action: PayloadAction<SB_UniversityOverviews>) => {
                state.status = 'success';
                state.overviews.push(action.payload);
            })
            .addCase(createUniversityOverviewThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al crear el overview.';
            })

            .addCase(updateUniversityOverviewThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(updateUniversityOverviewThunk.fulfilled, (state, action: PayloadAction<SB_UniversityOverviews>) => {
                state.status = 'success';
                const index = state.overviews.findIndex((ov) => ov.id === action.payload.id);
                if (index !== -1) state.overviews[index] = action.payload;
            })
            .addCase(updateUniversityOverviewThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al actualizar el overview.';
            })

            .addCase(deleteUniversityOverviewThunk.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(deleteUniversityOverviewThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.status = 'success';
                state.overviews = state.overviews.filter((ov) => ov.id !== action.payload);
            })
            .addCase(deleteUniversityOverviewThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al eliminar el overview.';
            });
    },
});

export const { clearUniversityDetail, clearSelectedOverview } = universitySlice.actions;
export default universitySlice.reducer;