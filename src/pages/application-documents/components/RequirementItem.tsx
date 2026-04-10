import { DocumentUploadBox } from './DocumentUploadBox';
import type { UserDocument } from '../../../shared/models/documentModel';
import type { RequirementStatus } from '../../../shared/models/applicationModel';

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
  
  const getFileName = (path: string) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    const match = fileName.match(/^\d+-(.+)$/);
    return match ? match[1] : fileName;
  };

  if (hasExisting) {
    return (
      <div className="flex items-start gap-3 sm:gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900">{requirement.description}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              En tu perfil
            </span>
          </div>
          
          {existingDoc && (
            <p className="text-sm text-gray-600 mt-1 truncate">
              {getFileName(existingDoc.document_path)}
            </p>
          )}
          
          {requirement.notes && (
            <p className="text-xs text-gray-500 mt-2 italic">{requirement.notes}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <p className="font-medium text-gray-900">{requirement.description}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              Pendiente
            </span>
          </div>
          
          {requirement.notes && (
            <p className="text-xs text-gray-600 mb-3 italic">{requirement.notes}</p>
          )}

          <DocumentUploadBox
            onUpload={onUpload}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
