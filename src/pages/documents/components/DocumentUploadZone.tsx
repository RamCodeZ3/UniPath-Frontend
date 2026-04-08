import { useRef, useState } from 'react';
import { validateFile } from '../../../shared/utils/fileValidator';

interface DocumentUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  error?: string | null;
  maxFiles?: number;
  currentFileCount?: number;
}

const CloudUploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62m0 0L23 16M4.41 9.6L1 13m3 2.26l.82.82M3 13H1" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
  </svg>
);

export const DocumentUploadZone = ({
  onFilesSelected,
  isLoading = false,
  error = null,
  maxFiles = 10,
  currentFileCount = 0,
}: DocumentUploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const remainingSlots = maxFiles - currentFileCount;
  const canUpload = remainingSlots > 0 && !isLoading;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (files: File[]) => {
    setValidationError(null);
    setSelectedFileName(null);

    if (files.length === 0) return;

    // Validar cada archivo
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'Error al validar archivo');
        return;
      }

      // Verificar límite de archivos
      if (validFiles.length + currentFileCount >= maxFiles) {
        setValidationError(`Máximo de ${maxFiles} documentos alcanzado`);
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFileName(
        validFiles.length === 1
          ? validFiles[0].name
          : `${validFiles.length} archivos seleccionados`
      );
      onFilesSelected(validFiles);
    }

    // Resetear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (canUpload && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Zona de drag & drop */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          !canUpload
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        {/* Contenido */}
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <>
              <SpinnerIcon className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-700 font-medium">Subiendo documento...</p>
            </>
          ) : error ? (
            <>
              <AlertIcon className="w-12 h-12 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </>
          ) : validationError ? (
            <>
              <AlertIcon className="w-12 h-12 text-red-500" />
              <p className="text-red-700 font-medium">{validationError}</p>
            </>
          ) : selectedFileName ? (
            <>
              <CheckIcon className="w-12 h-12 text-green-500" />
              <p className="text-green-700 font-medium">Listo para subir</p>
              <p className="text-sm text-gray-600">{selectedFileName}</p>
            </>
          ) : (
            <>
              <CloudUploadIcon className="w-12 h-12 text-gray-400" />
              <p className="text-gray-900 font-medium">
                Arrastra documentos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Formatos aceptados: PDF, JPG, PNG, GIF
              </p>
            </>
          )}
        </div>

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={!canUpload}
        />
      </div>

      {/* Información de límite */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <p className="text-gray-600">
          <span className="font-medium">{currentFileCount}</span> de{' '}
          <span className="font-medium">{maxFiles}</span> documentos cargados
        </p>
        {remainingSlots <= 3 && remainingSlots > 0 && (
          <p className="text-orange-600 font-medium">
            {remainingSlots} {remainingSlots === 1 ? 'espacio' : 'espacios'} disponible{remainingSlots === 1 ? '' : 's'}
          </p>
        )}
        {remainingSlots === 0 && (
          <p className="text-red-600 font-medium">Límite alcanzado</p>
        )}
      </div>
    </div>
  );
};
