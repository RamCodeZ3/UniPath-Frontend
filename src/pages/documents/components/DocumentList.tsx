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

  // Icono genérico para imágenes
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
    const fileName = doc.document_name || doc.document_path.split('/').pop() || 'documento';
    onDownload(doc.document_path, fileName);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Error al cargar documentos</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-3">
          <DocumentIcon type="image" className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium mb-1">No tienes documentos cargados</p>
        <p className="text-gray-500 text-sm">Sube tu primer documento para empezar</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Información del documento */}
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

                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate hover:text-blue-600 cursor-pointer">
                    {doc.document_name || doc.document_path.split('/').pop() || 'Documento'}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                      {getFileTypeLabel(doc.document_name || doc.document_path)}
                    </span>
                    <span>{formatDate()}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal de confirmación de eliminación */}
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
              {isDeleting && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        }
      >
        <p className="text-gray-700">
          ¿Estás seguro de que deseas eliminar{' '}
          <span className="font-medium">{selectedDeleteDoc?.document_name}</span>? Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
};
