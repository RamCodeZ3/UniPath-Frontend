interface DocumentRecommendationCardProps {
  answer: string;
  loading: boolean;
  error?: string | null;
  documentsUsed?: number;
}

export const DocumentRecommendationCard = ({
  answer,
  loading,
  error,
  documentsUsed,
}: DocumentRecommendationCardProps) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Analizando tus documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[DocumentRecommendation] Error:', error);
    return null;
  }

  if (!answer) {
    return null;
  }

  const formatAnswer = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-bold text-gray-900 mt-3 mb-1">
            {line.replace(/\*\*/g, '')}
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Análisis de documentos</h3>
        </div>
        {documentsUsed !== undefined && (
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {documentsUsed} documento{documentsUsed !== 1 ? 's' : ''} analizado
            {documentsUsed !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="text-sm">{formatAnswer(answer)}</div>
    </div>
  );
};
