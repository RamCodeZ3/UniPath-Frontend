interface UniversityHeaderProps {
  universityName: string;
  onBack: () => void;
}

export const UniversityHeader = ({ universityName, onBack }: UniversityHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Universidades
          </button>
          <span>/</span>
          <span>Aplicar</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{universityName}</h1>
        <p className="text-gray-600 mt-2">Completa los documentos requeridos para tu solicitud</p>
      </div>

      <button
        onClick={onBack}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Volver"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
