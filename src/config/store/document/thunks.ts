import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getAllDocumentsByProfileId,
    createDocument,
    deleteDocument,
    uploadDocument
} from '../../../shared/services/documentServices';
import type { SB_Documents } from '../../../shared/models/documentModel';


export const fetchGetDocumentsByProfileId = createAsyncThunk(
    'document/fetchGetDocumentsByProfileId',
    async (profileId: string, { rejectWithValue }) => {
        try {
            const documents = await getAllDocumentsByProfileId(profileId);
            return documents;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchUploadDocument = createAsyncThunk(
    'document/fetchUploadDocument',
    async (
        { profileId, file, fileName }: { profileId: string; file: File | Blob; fileName?: string },
        { rejectWithValue }
    ) => {
        try {
            const publicUrl = await uploadDocument(profileId, file, fileName);
            return publicUrl;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAddDocument = createAsyncThunk(
    'document/fetchAddDocument',
    async (
        document: Omit<SB_Documents, 'id' | 'created_at'>,
        { rejectWithValue }
    ) => {
        try {
            const newDocument = await createDocument(document);
            return newDocument;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchDeleteDocument = createAsyncThunk(
    'document/fetchDeleteDocument',
    async (documentId: string, { rejectWithValue }) => {
        try {
            await deleteDocument(documentId);
            return documentId;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);