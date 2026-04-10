import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SB_Documents, DocumentRecommendationResponse } from '../../../shared/models/documentModel';
import {
    fetchGetDocumentsByProfileId,
    fetchUploadDocument,
    fetchAddDocument,
    fetchDeleteDocument,
    fetchRecommendDocuments,
} from './thunks';

export interface DocumentState {
    documents: SB_Documents[];
    uploadedUrl: string | null;
    recommendation: DocumentRecommendationResponse | null;
    status: 'idle' | 'pending' | 'success' | 'failed';
    recommendationStatus: 'idle' | 'pending' | 'success' | 'failed';
    error: string | null;
}

const initialState: DocumentState = {
    documents: [],
    uploadedUrl: null,
    recommendation: null,
    status: 'idle',
    recommendationStatus: 'idle',
    error: null,
};

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        clearUploadedUrl: (state) => {
            state.uploadedUrl = null;
        },
        clearRecommendation: (state) => {
            state.recommendation = null;
            state.recommendationStatus = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetDocumentsByProfileId.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchGetDocumentsByProfileId.fulfilled, (state, action: PayloadAction<SB_Documents[]>) => {
                state.status = 'success';
                state.documents = action.payload;
            })
            .addCase(fetchGetDocumentsByProfileId.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al obtener los documentos.';
            })

            .addCase(fetchUploadDocument.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchUploadDocument.fulfilled, (state, action: PayloadAction<string>) => {
                state.status = 'success';
                state.uploadedUrl = action.payload;
            })
            .addCase(fetchUploadDocument.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al subir el archivo.';
            })

            .addCase(fetchAddDocument.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchAddDocument.fulfilled, (state, action: PayloadAction<SB_Documents>) => {
                state.status = 'success';
                state.documents.push(action.payload);
            })
            .addCase(fetchAddDocument.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al crear el documento.';
            })

            .addCase(fetchDeleteDocument.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchDeleteDocument.fulfilled, (state, action: PayloadAction<string>) => {
                state.status = 'success';
                state.documents = state.documents.filter((doc) => doc.id !== action.payload);
            })
            .addCase(fetchDeleteDocument.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string ?? 'Error al eliminar el documento.';
            })

            .addCase(fetchRecommendDocuments.pending, (state) => {
                state.recommendationStatus = 'pending';
                state.error = null;
            })
            .addCase(fetchRecommendDocuments.fulfilled, (state, action: PayloadAction<DocumentRecommendationResponse>) => {
                state.recommendationStatus = 'success';
                state.recommendation = action.payload;
            })
            .addCase(fetchRecommendDocuments.rejected, (state, action) => {
                state.recommendationStatus = 'failed';
                state.error = action.payload as string ?? 'Error al obtener la recomendación.';
            });
    },
});

export const { clearUploadedUrl, clearRecommendation } = documentSlice.actions;
export default documentSlice.reducer;