import { Button } from 'primereact/button';

interface ProgressMilestone {
  label: string;
  done: boolean;
}

interface ProgressHeroProps {
  userName: string;
  completedSteps: number;
  totalSteps: number;
  milestones: ProgressMilestone[];
  primaryActionLabel: string;
  primaryActionDescription: string;
  onPrimaryAction: () => void;
}

export const ProgressHero = ({
  userName,
  completedSteps,
  totalSteps,
  milestones,
  primaryActionLabel,
  primaryActionDescription,
  onPrimaryAction,
}: ProgressHeroProps) => {
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <i className="pi pi-compass text-[11px]" />
            Ruta de postulacion
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Hola, {userName}</h1>
          <p className="text-gray-600 mt-2">
            Tu avance actual es de <span className="font-semibold text-gray-900">{progressPercentage}%</span>.
            {' '}Completa los siguientes pasos para aumentar tus oportunidades.
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Progreso general</span>
              <span className="text-gray-900 font-semibold">
                {completedSteps}/{totalSteps}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercentage >= 100 ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:w-96 w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Siguiente paso recomendado</h2>
          <p className="text-sm text-gray-600 mb-4">{primaryActionDescription}</p>
          <Button
            label={primaryActionLabel}
            icon="pi pi-arrow-right"
            iconPos="right"
            className="w-full"
            onClick={onPrimaryAction}
          />
        </div>
      </div>

      <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.label}
            className={`rounded-xl border p-2.5 sm:p-3 flex items-center gap-2 ${
              milestone.done
                ? 'bg-green-50 border-green-100 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <i className={`pi ${milestone.done ? 'pi-check-circle' : 'pi-circle'} text-sm`} />
            <span className="text-xs font-medium leading-snug">{milestone.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
