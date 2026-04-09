import { Button } from 'primereact/button';
import type { SB_Scholarship } from '../../../shared/models/scholarshipsModel';

interface UpcomingScholarshipsProps {
  scholarships: SB_Scholarship[];
  onOpenScholarships: () => void;
}

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

const daysUntil = (value?: string) => {
  if (!value) return null;

  const now = new Date();
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return null;

  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const UpcomingScholarships = ({ scholarships, onOpenScholarships }: UpcomingScholarshipsProps) => {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Becas con cierre cercano</h2>
          <p className="text-sm text-gray-600 mt-1">No dejes pasar las fechas limite</p>
        </div>
        <Button
          label="Ver todas"
          icon="pi pi-arrow-right"
          text
          size="small"
          onClick={onOpenScholarships}
        />
      </div>

      {scholarships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No hay becas abiertas con fechas proximas en este momento.
        </div>
      ) : (
        <div className="space-y-3">
          {scholarships.map((scholarship) => {
            const remainingDays = daysUntil(scholarship.application_deadline);
            const urgencyClass =
              remainingDays !== null && remainingDays <= 7
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-amber-50 text-amber-700 border-amber-100';

            return (
              <article key={scholarship.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{scholarship.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{scholarship.offered_by}</p>
                  </div>
                  {remainingDays !== null && (
                    <span className={`text-[11px] px-2 py-1 rounded-full border font-medium ${urgencyClass}`}>
                      {remainingDays <= 0 ? 'Cierra hoy' : `${remainingDays} dias`}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <i className="pi pi-calendar text-[10px]" />
                    {formatDate(scholarship.application_deadline)}
                  </span>
                  {scholarship.covers_tuition && (
                    <span className="inline-flex items-center gap-1 text-blue-700">
                      <i className="pi pi-check-circle text-[10px]" />
                      Matricula
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
