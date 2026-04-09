import { useSelector } from 'react-redux';
import type { SB_Scholarship } from '../../../shared/models/scholarshipsModel';
import type { RootState } from '../../../store/store';
import { ApplyScholarshipButton } from './ApplyScholarshipButton';

interface ScholarshipCardProps {
  scholarship: SB_Scholarship;
  onClick: (scholarship: SB_Scholarship) => void;
}

const ScholarshipIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5z" />
    <path d="M6 10.5V15a6 6 0 0 0 12 0v-4.5" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M8 2v4M16 2v4M3 10h18" />
  </svg>
);

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const ScholarshipCard = ({ scholarship, onClick }: ScholarshipCardProps) => {
  const { profile } = useSelector((state: RootState) => state.auth);
  const profileId = profile?.id;

  const isOpen = scholarship.status === 'open';

  return (
    <div
      onClick={() => onClick(scholarship)}
      className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <ScholarshipIcon className="w-7 h-7 text-blue-600" />
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isOpen ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isOpen ? 'Abierta' : 'Cerrada'}
        </span>
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {scholarship.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{scholarship.offered_by}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {scholarship.covers_tuition && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            Matricula
          </span>
        )}
        {scholarship.covers_living_expenses && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            Vivienda
          </span>
        )}
        {scholarship.covers_transport && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            Transporte
          </span>
        )}
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Fecha limite</p>
          <p className="font-medium text-gray-700">{formatDate(scholarship.application_deadline)}</p>
        </div>
      </div>

      {profileId && (
        <div className="mt-auto pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <ApplyScholarshipButton
            scholarshipId={scholarship.id}
            scholarshipTitle={scholarship.title}
            profileId={profileId}
            variant="primary"
          />
        </div>
      )}
    </div>
  );
};
