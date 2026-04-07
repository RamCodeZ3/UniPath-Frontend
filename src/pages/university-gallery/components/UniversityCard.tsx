import type { SB_University } from '../../../shared/models/universityModel';

interface UniversityCardProps {
  university: SB_University;
  onClick: (university: SB_University) => void;
}

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const getModalityLabel = (modality: string): string => {
  const labels: Record<string, string> = {
    presencial: 'Presencial',
    virtual: 'Virtual',
    semipresencial: 'Semipresencial',
  };
  return labels[modality] || modality;
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    publica: 'Pública',
    privada: 'Privada',
  };
  return labels[type] || type;
};

const getModalityColor = (modality: string): string => {
  const colors: Record<string, string> = {
    presencial: 'bg-blue-100 text-blue-700',
    virtual: 'bg-purple-100 text-purple-700',
    semipresencial: 'bg-teal-100 text-teal-700',
  };
  return colors[modality] || 'bg-gray-100 text-gray-700';
};

export const UniversityCard = ({ university, onClick }: UniversityCardProps) => {
  return (
    <div
      onClick={() => onClick(university)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
    >
      {/* Header con icono y badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <BuildingIcon className="w-7 h-7 text-blue-600" />
        </div>
        <div className="flex items-center gap-2">
          {/* Badge de acreditación */}
          {university.accredited && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <CheckBadgeIcon className="w-4 h-4" />
              <span>Acreditada</span>
            </div>
          )}
        </div>
      </div>

      {/* Nombre y acrónimo */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {university.name}
        </h3>
        {university.acronym && (
          <span className="text-sm font-medium text-gray-500">
            ({university.acronym})
          </span>
        )}
      </div>

      {/* Dirección */}
      {university.address && (
        <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
          <LocationIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{university.address}</span>
        </div>
      )}

      {/* Tags de tipo y modalidad */}
      <div className="flex flex-wrap gap-2 mt-auto">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {getTypeLabel(university.type)}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getModalityColor(university.modality)}`}>
          {getModalityLabel(university.modality)}
        </span>
      </div>
    </div>
  );
};


