import { RequirementItem } from './RequirementItem';
import type { RequirementStatus } from '../../../shared/services/applicationDocumentService';

interface RequirementsListProps {
  title?: string;
  subtitle?: string;
  requirements: RequirementStatus[];
  onFileUpload: (requirementId: string, file: File) => void;
  uploadingRequirementId: string | null;
  completedCount?: number;
  totalCount?: number;
}

export const RequirementsList = ({
  title = 'Requerimientos',
  subtitle,
  requirements,
  onFileUpload,
  uploadingRequirementId,
  completedCount,
  totalCount,
}: RequirementsListProps) => {
  const showProgress = completedCount !== undefined && totalCount !== undefined;
  const progressPercentage = showProgress && totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header con título y progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {showProgress && (
            <span className="text-sm font-medium text-gray-600">
              {completedCount}/{totalCount} completados
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        
        {/* Barra de progreso */}
        {showProgress && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Lista de requerimientos */}
      {requirements.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500">No hay requerimientos en esta sección</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((requirement) => (
            <RequirementItem
              key={requirement.requirementId}
              requirement={requirement}
              hasExisting={requirement.hasExistingDocument}
              existingDoc={requirement.existingDocument}
              onUpload={(file) => onFileUpload(requirement.requirementId, file)}
              isLoading={uploadingRequirementId === requirement.requirementId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
