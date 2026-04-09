import { Button } from 'primereact/button';

interface ScholarshipSummaryProps {
  completedCount: number;
  totalCount: number;
  canConfirm: boolean;
  isConfirming: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export const ScholarshipSummary = ({
  completedCount,
  totalCount,
  canConfirm,
  isConfirming,
  onConfirm,
  onBack,
}: ScholarshipSummaryProps) => {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-20">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Resumen de Postulacion</h3>
      <p className="text-sm text-gray-500 mb-4">Verifica tu avance antes de enviar</p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Documentos completados</span>
          <span className={`text-lg font-bold ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isComplete ? (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-green-800">Listo para enviar tu postulacion de beca.</p>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-600">Completa todos los documentos para confirmar la postulacion.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          label={isConfirming ? 'Enviando...' : 'Confirmar Postulacion'}
          icon={isConfirming ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
          className="w-full"
          disabled={!canConfirm || isConfirming}
          onClick={onConfirm}
          severity="success"
        />
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          className="w-full"
          onClick={onBack}
          disabled={isConfirming}
          outlined
          severity="secondary"
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p className="text-xs text-gray-500">Tus documentos estan protegidos</p>
      </div>
    </div>
  );
};
