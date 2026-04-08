import { RequirementItem } from './RequirementItem';
import type { RequirementStatus } from '../../../shared/services/applicationDocumentService';

interface RequirementsListProps {
  requirements: RequirementStatus[];
  onFileUpload: (requirementId: string, file: File) => void;
  uploadingRequirementId: string | null;
}

export const RequirementsList = ({
  requirements,
  onFileUpload,
  uploadingRequirementId,
}: RequirementsListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Requerimientos</h2>

      {requirements.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">No hay requerimientos disponibles para esta universidad</p>
        </div>
      ) : (
        requirements.map((requirement) => (
          <RequirementItem
            key={requirement.requirementId}
            requirement={requirement}
            hasExisting={requirement.hasExistingDocument}
            existingDoc={requirement.existingDocument}
            onUpload={(file) => onFileUpload(requirement.requirementId, file)}
            isLoading={uploadingRequirementId === requirement.requirementId}
          />
        ))
      )}
    </div>
  );
};
