const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

import type { DocumentRecommendationResponse, DocumentRecommendationError } from "../models/documentModel";

export const recommendDocuments = async (
    profileId: string,
    universityId: string
): Promise<DocumentRecommendationResponse> => {
    const baseUrl = SUPABASE_URL.replace("https://", "https://");
    const functionUrl = `${baseUrl}/functions/v1/document_recommender`;

    const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            profile_id: profileId,
            university_id: universityId
        })
    });

    const data: DocumentRecommendationResponse | DocumentRecommendationError = await response.json();

    if (!response.ok) {
        throw new Error((data as DocumentRecommendationError).error || "Error al obtener la recomendación");
    }

    return data as DocumentRecommendationResponse;
};
