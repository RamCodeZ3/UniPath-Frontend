import { useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import type { SB_Scholarship, ScholarshipRequirement } from '../../../shared/models/scholarshipsModel';
import type { RootState } from '../../../app/store/store';
import { ApplyScholarshipButton } from './ApplyScholarshipButton';

interface ScholarshipDetailModalProps {
  scholarship: SB_Scholarship | null;
  requirements: ScholarshipRequirement[];
  visible: boolean;
  onHide: () => void;
  loading?: boolean;
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

const formatCoverage = (amount?: number, currency?: string) => {
  if (typeof amount !== 'number') return 'No especificado';
  try {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

export const ScholarshipDetailModal = ({
  scholarship,
  requirements,
  visible,
  onHide,
  loading = false,
}: ScholarshipDetailModalProps) => {
  const { profile } = useSelector((state: RootState) => state.auth);
  const profileId = profile?.id;

  if (!scholarship) return null;

  const headerContent = (
    <div className="flex items-center gap-3 pt-5 sm:pt-8 pb-2 px-4 sm:px-6">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
        <ScholarshipIcon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">{scholarship.title}</h2>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg mt-1 inline-block">
          {scholarship.offered_by}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      onHide={onHide}
      style={{ width: '96vw', maxWidth: '620px' }}
      modal
      dismissableMask
      className="scholarship-detail-modal"
      contentClassName="p-0"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600" />
        </div>
      ) : (
        <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-2 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                scholarship.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {scholarship.status === 'open' ? 'Abierta' : 'Cerrada'}
            </span>
            {scholarship.academic_level && (
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {scholarship.academic_level}
              </span>
            )}
            {scholarship.duration && (
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                Duracion: {scholarship.duration}
              </span>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <i className="pi pi-id-card text-blue-600" />
              Resumen de la beca
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Cobertura estimada</p>
                <p className="font-semibold text-gray-900">
                  {formatCoverage(scholarship.coverage_amount, scholarship.currency)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Moneda</p>
                <p className="font-semibold text-gray-900">{scholarship.currency}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100 flex items-start gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Inicio de aplicacion</p>
                  <p className="font-semibold text-gray-900">{formatDate(scholarship.application_start_date)}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100 flex items-start gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha limite</p>
                  <p className="font-semibold text-gray-900">{formatDate(scholarship.application_deadline)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {scholarship.covers_tuition && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  <i className="pi pi-check-circle" />
                  Matricula
                </span>
              )}
              {scholarship.covers_living_expenses && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  <i className="pi pi-check-circle" />
                  Gastos de vida
                </span>
              )}
              {scholarship.covers_transport && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  <i className="pi pi-check-circle" />
                  Transporte
                </span>
              )}
              {scholarship.covers_other && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                  <i className="pi pi-star-fill" />
                  {scholarship.covers_other}
                </span>
              )}
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <i className="pi pi-list-check text-amber-700" />
              Requisitos ({requirements.length})
            </h3>

            {requirements.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {requirements.map((requirement) => (
                  <div key={requirement.requirementId} className="bg-white rounded-lg p-3 border border-amber-100">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">{requirement.description}</p>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                          requirement.isMandatory
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {requirement.isMandatory ? 'Obligatorio' : 'Opcional'}
                      </span>
                    </div>
                    {requirement.notes && (
                      <p className="text-xs text-gray-600 italic mt-2">{requirement.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-800">
                Esta beca no tiene requisitos publicados por el momento.
              </p>
            )}
          </div>

          {profileId && scholarship.status === 'open' && (
            <div className="pt-3 border-t border-gray-100">
              <ApplyScholarshipButton
                scholarshipId={scholarship.id}
                scholarshipTitle={scholarship.title}
                profileId={profileId}
                variant="primary"
              />
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
