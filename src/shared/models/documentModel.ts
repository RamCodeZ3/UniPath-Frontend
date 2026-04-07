export interface SB_Documents{
    id?: string;
    profile_id: string;
    document_name: string;
    type: string;
    document_path: string;
}

export interface DocumentRecommendationResponse {
    answer: string;
    documents_used: number;
}

export interface DocumentRecommendationError {
    error: string;
}