import { Button } from 'primereact/button';

interface PaymentSummaryProps {
  completedCount: number;
  totalCount: number;
  hasUnsavedChanges: boolean;
  canConfirm: boolean;
  isConfirming: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export const PaymentSummary = ({
  completedCount,
  totalCount,
  hasUnsavedChanges,
  canConfirm,
  isConfirming,
  onConfirm,
  onBack,
}: PaymentSummaryProps) => {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="sticky top-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Solicitud</h3>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Requerimientos completados
          </span>
          <span className="text-lg font-bold text-blue-600">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Cost Section */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">Costo de Solicitud</span>
          <span className="text-3xl font-bold text-green-600">
            💰 RD$ 1,000
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Se cobrará al confirmar la aplicación
        </p>

        {hasUnsavedChanges && (
          <div className="mt-3 p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-800">
              ⚠️ Tienes documentos sin guardar. Se guardarán al confirmar.
            </p>
          </div>
        )}

        {completedCount === totalCount && totalCount > 0 && !hasUnsavedChanges && (
          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-xs text-green-800">
              ✅ Todos los requerimientos completados. Listo para aplicar.
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 flex-col">
        <Button
          label="Confirmar Aplicación"
          icon="pi pi-check"
          className="w-full p-button-primary"
          disabled={!canConfirm || isConfirming}
          onClick={onConfirm}
          loading={isConfirming}
          severity={isConfirming ? 'warning' : 'success'}
        />
        <Button
          label="Atrás"
          icon="pi pi-arrow-left"
          className="w-full p-button-outlined"
          onClick={onBack}
          disabled={isConfirming}
        />
      </div>

      {/* Info Footer */}
      <p className="text-xs text-gray-600 text-center mt-4 pt-4 border-t border-blue-200">
        Tu información está protegida y encriptada
      </p>
    </div>
  );
};
