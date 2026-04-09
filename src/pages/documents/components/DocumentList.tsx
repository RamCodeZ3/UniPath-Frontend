import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import type { SB_Documents } from '../../../shared/models/documentModel';
import { getFileTypeLabel } from '../../../shared/utils/fileValidator';

interface DocumentListProps {
  documents: SB_Documents[];
  isLoading: boolean;
  error?: string | null;
  onDelete: (documentId: string) => void;
  onDownload: (filePath: string, fileName: string) => void;
  isDeleting?: boolean;
}

const DocumentIcon = ({ type, className }: { type: string; className?: string }) => {
  if (type === 'PDF') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20a2,2 0 0,0 2,2H18a2,2 0 0,0 2,-2V8L14,2M18,20H6V4h7V9h5V20M7,12h2v2H7V12m4,0h2v2h-2V12m4,0h2v2h-2V12M7,16h8v2H7V16Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
};

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const SkeletonLoader = () => (
  <div className="animate-pulse border border-gray-200 rounded-lg p-4 mb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-9 h-9 bg-gray-200 rounded"></div>
        <div className="w-9 h-9 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export const DocumentList = ({
  documents,
  isLoading,
  error = null,
  onDelete,
  onDownload,
  isDeleting = false,
}: DocumentListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedDeleteDoc, setSelectedDeleteDoc] = useState<SB_Documents | null>(null);
  const [previewDocument, setPreviewDocument] = useState<SB_Documents | null>(null);

  const getDisplayName = (doc: SB_Documents): string => {
    const raw = doc.document_name || doc.document_path.split('/').pop() || 'Documento';
    return decodeURIComponent(raw)
      .replace(/^\d+-/, '')
      .replace(/[_]/g, ' ')
      .trim();
  };

  const getFileType = (doc: SB_Documents): 'image' | 'pdf' | 'other' => {
    const fileName = doc.document_name || doc.document_path || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const getPreviewUrl = (doc: SB_Documents): string => {
    return doc.document_path;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const handleDeleteClick = (doc: SB_Documents) => {
    setSelectedDeleteDoc(doc);
    setDeleteConfirm(doc.id || '');
  };

  const confirmDelete = () => {
    if (deleteConfirm && selectedDeleteDoc) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
      setSelectedDeleteDoc(null);
    }
  };

  const handleDownload = (doc: SB_Documents) => {
    const fileName = getDisplayName(doc);
    onDownload(doc.document_path, fileName);
  };

  return (
    <div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DocumentIcon
                      type={doc.type || 'image'}
                      className={`w-6 h-6 ${
                        doc.type === 'PDF' ? 'text-red-600' : 'text-blue-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPreviewDocument(doc)}>
                  <p className="text-gray-900 font-medium truncate hover:text-blue-600 transition-colors">
                    {getDisplayName(doc)}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                      {getFileTypeLabel(doc.document_name || doc.document_path)}
                    </span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setPreviewDocument(doc)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  title="Vista previa"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar"
                >
                  <DownloadIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteClick(doc)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        visible={deleteConfirm !== null}
        onHide={() => setDeleteConfirm(null)}
        header="Confirmar eliminación"
        modal
        className="w-full max-w-md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        }
      >
        <p className="text-gray-700">
          ¿Estás seguro de que deseas eliminar{' '}
          <span className="font-medium">
            {selectedDeleteDoc ? getDisplayName(selectedDeleteDoc) : ''}
          </span>
          ? Esta acción no se puede deshacer.
        </p>
      </Dialog>

      <Dialog
        visible={previewDocument !== null}
        onHide={() => setPreviewDocument(null)}
        header={
          previewDocument ? (
            <div className="flex items-center gap-2">
              <span>{getDisplayName(previewDocument)}</span>
              {getFileType(previewDocument) !== 'pdf' && (
                <button
                  onClick={() => {
                    window.open(getPreviewUrl(previewDocument), '_blank');
                  }}
                  className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Abrir en nueva pestaña"
                >
                  <ExternalLinkIcon className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ) : null
        }
        modal
        style={{ width: '90vw', maxWidth: '800px' }}
        contentClassName="p-0"
      >
        {previewDocument && (
          <div className="flex flex-col items-center">
            {getFileType(previewDocument) === 'image' && (
              <img
                src={getPreviewUrl(previewDocument)}
                alt={getDisplayName(previewDocument)}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
            
            {getFileType(previewDocument) === 'pdf' && (
              <div className="w-full h-[70vh]">
                <iframe
                  src={`${getPreviewUrl(previewDocument)}#toolbar=0`}
                  className="w-full h-full border-0"
                  title={getDisplayName(previewDocument)}
                />
              </div>
            )}
            
            {getFileType(previewDocument) === 'other' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DocumentIcon
                  type="file"
                  className="w-16 h-16 text-gray-400 mb-4"
                />
                <p className="text-gray-600 mb-4">
                  Vista previa no disponible para este tipo de archivo
                </p>
                <button
                  onClick={() => handleDownload(previewDocument)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Descargar archivo
                </button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};
