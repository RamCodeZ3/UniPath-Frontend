import { useState } from "react";
import { recommendDocuments } from "../services/documentRecommender";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

interface DocumentRecommenderProps {
    profileId: string;
    universityId: string;
}

export default function DocumentRecommender({ profileId, universityId }: DocumentRecommenderProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [documentsUsed, setDocumentsUsed] = useState<number>(0);

    const handleRecommend = async () => {
        setLoading(true);
        setError(null);
        setRecommendation(null);

        try {
            const result = await recommendDocuments(profileId, universityId);
            setRecommendation(result.answer);
            setDocumentsUsed(result.documents_used);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error desconocido al obtener la recomendación";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const formatAnswer = (text: string) => {
        return text.split("\n").map((line, index) => {
            if (line.startsWith("**") && line.endsWith("**")) {
                return (
                    <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2">
                        {line.replace(/\*\*/g, "")}
                    </h4>
                );
            }

            const boldRegex = /\*\*(.*?)\*\*/g;
            const parts = line.split(boldRegex);

            return (
                <p key={index} className="text-gray-700 mb-1">
                    {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                </p>
            );
        });
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <button
                    type="button"
                    onClick={handleRecommend}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading && <i className="pi pi-spin pi-spinner text-sm" />}
                    {loading ? "Analizando documentos..." : "Analizar documentos"}
                </button>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <ProgressSpinner style={{ width: "40px", height: "40px" }} strokeWidth="4" />
                    <p className="text-gray-500 mt-3">Analizando tus documentos con IA...</p>
                </div>
            )}

            {error && (
                <Message
                    severity="error"
                    text={error}
                    className="w-full"
                />
            )}

            {recommendation && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Análisis de documentos
                        </h3>
                        <span className="text-sm text-gray-500">
                            {documentsUsed} documento{documentsUsed !== 1 ? "s" : ""} analizado{documentsUsed !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                        {formatAnswer(recommendation)}
                    </div>
                </div>
            )}
        </div>
    );
}
