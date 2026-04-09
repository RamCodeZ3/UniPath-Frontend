import React from 'react';

interface MainDocument {
  id: string;
  name: string;
  documentType: string;
  hasDocument: boolean;
  documentPath?: string;
}

interface MainDocumentsGridProps {
  documents: MainDocument[];
  onUpload: (documentId: string, file: File) => void;
  uploadingId: string | null;
}

export const MainDocumentsGrid: React.FC<MainDocumentsGridProps> = ({
  documents,
  onUpload,
  uploadingId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.name}</h3>
          </div>

          {!doc.hasDocument ? (
            <label className="block">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm font-medium text-blue-600 mb-1">Subir archivo</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG o GIF (máx 20MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUpload(doc.id, file);
                    }
                  }}
                  disabled={uploadingId === doc.id}
                />
              </div>
            </label>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium mb-2">✅ Ya lo tienes</p>
              <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                <span>📄</span> Documento guardado
              </p>
              <label className="mt-4 block">
                <div className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">
                  Cambiar archivo
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onUpload(doc.id, file);
                      }
                    }}
                    disabled={uploadingId === doc.id}
                  />
                </div>
              </label>
            </div>
          )}

          {uploadingId === doc.id && (
            <div className="mt-3 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-blue-600">Guardando...</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
