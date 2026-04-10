import type { ScholarshipRequirementStatus } from '../../../shared/models/scholarshipsModel';
import { ScholarshipRequirementItem } from './ScholarshipRequirementItem';

interface ScholarshipRequirementsListProps {
  requirements: ScholarshipRequirementStatus[];
  onFileUpload: (requirementId: string, file: File) => void;
  uploadingRequirementId: string | null;
}

export function ScholarshipRequirementsList({
  requirements,
  onFileUpload,
  uploadingRequirementId,
}: ScholarshipRequirementsListProps){
  const completedCount = requirements.filter((r) => r.hasExistingDocument).length;
  const totalCount = requirements.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Requisitos de beca</h2>
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{totalCount} completados
          </span>
        </div>
        <p className="text-sm text-gray-500">Documentos solicitados para esta beca</p>

        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500">No hay requisitos definidos para esta beca</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((requirement) => (
            <ScholarshipRequirementItem
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
