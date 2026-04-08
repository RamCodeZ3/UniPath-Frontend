import { DocumentUploadBox } from './DocumentUploadBox';
import type { RequirementStatus, UserDocument } from '../../../shared/services/applicationDocumentService';

interface RequirementItemProps {
  requirement: RequirementStatus;
  hasExisting: boolean;
  existingDoc?: UserDocument;
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const RequirementItem = ({
  requirement,
  hasExisting,
  existingDoc,
  onUpload,
  isLoading,
}: RequirementItemProps) => {
  if (hasExisting) {
    return (
      <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <svg
          className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>

        <div className="flex-1">
          <p className="font-medium text-gray-900">{requirement.description}</p>
          <p className="text-sm text-green-700 mt-1">✅ Ya lo tienes</p>
          {existingDoc && (
            <p className="text-xs text-gray-600 mt-2">
              📄 {existingDoc.document_path.split('/').pop()}
            </p>
          )}
          {requirement.notes && (
            <p className="text-xs text-gray-600 mt-2 italic">💡 {requirement.notes}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-medium text-gray-900">{requirement.description}</p>
          {requirement.notes && (
            <p className="text-xs text-gray-600 mt-1 italic">💡 {requirement.notes}</p>
          )}
        </div>
      </div>

      <DocumentUploadBox
        onUpload={onUpload}
        isLoading={isLoading}
      />
    </div>
  );
};
