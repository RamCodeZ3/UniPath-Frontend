import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import type { UniversityWithDetails } from '../../../shared/models/universityModel';

interface UniversityDetailModalProps {
  university: UniversityWithDetails | null;
  visible: boolean;
  onHide: () => void;
  loading?: boolean;
}

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const NoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
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
    hibrida: 'Híbrida',
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

export const UniversityDetailModal = ({
  university,
  visible,
  onHide,
  loading = false,
}: UniversityDetailModalProps) => {
  if (!university) return null;

  const headerContent = (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
        <BuildingIcon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {university.name}
        </h2>
        {university.acronym && (
          <span className="text-sm text-gray-500">({university.acronym})</span>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '600px' }}
      modal
      dismissableMask
      className="university-detail-modal"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {getTypeLabel(university.type)}
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {getModalityLabel(university.modality)}
            </span>
            {university.accredited && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <CheckBadgeIcon className="w-4 h-4" />
                Acreditada
              </span>
            )}
          </div>

          {/* Información de contacto */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <i className="pi pi-id-card text-blue-600" />
              Información de contacto
            </h3>

            {university.address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <LocationIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dirección</p>
                  <p className="text-sm text-gray-900">{university.address}</p>
                </div>
              </div>
            )}

            {university.contact_email && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <MailIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Correo electrónico</p>
                  <a
                    href={`mailto:${university.contact_email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {university.contact_email}
                  </a>
                </div>
              </div>
            )}

            {university.phone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <a
                    href={`tel:${university.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {university.phone}
                  </a>
                </div>
              </div>
            )}

            {university.website && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <GlobeIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sitio web</p>
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {university.website}
                    <i className="pi pi-external-link text-xs" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Requisitos y notas */}
          {university.university_requirements &&
            university.university_requirements.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                  <NoteIcon className="w-5 h-5 text-amber-600" />
                  Requisitos y notas
                </h3>
                <div className="space-y-2">
                  {university.university_requirements.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-lg p-3 text-sm text-gray-700"
                    >
                      {/* Mostrar descripción del requisito si existe */}
                      {req.enrollment_requirement?.description && (
                        <p className="font-medium text-gray-900 mb-1">
                          {req.enrollment_requirement.description}
                        </p>
                      )}
                      {/* Mostrar notas específicas de la universidad */}
                      {req.notas && (
                        <p className="text-gray-600 italic">{req.notas}</p>
                      )}
                      {/* Mostrar si aplica a extranjeros */}
                      {req.enrollment_requirement?.applies_to_foreigners && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Aplica a extranjeros
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Comentarios / Overviews */}
          {university.overviews && university.overviews.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <i className="pi pi-comments text-blue-600" />
                Reseñas ({university.overviews.length})
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {university.overviews.map((overview) => (
                  <div
                    key={overview.id}
                    className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic"
                  >
                    "{overview.comment}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de visitar sitio web */}
          {university.website && (
            <div className="pt-4 border-t border-gray-100">
              <Button
                label="Visitar sitio web"
                icon="pi pi-external-link"
                iconPos="right"
                className="btn-primary w-full justify-center"
                onClick={() => window.open(university.website!, '_blank')}
              />
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};


