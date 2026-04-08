import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { validateLogoFile, uploadAndSaveUniversityLogo } from '../../../shared/services/universityLogoService';

interface UniversityLogoUploadProps {
  universityId: string;
  universityName: string;
  onUploadSuccess?: (logoUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export const UniversityLogoUpload = ({
  universityId,
  universityName,
  onUploadSuccess,
  onUploadError,
}: UniversityLogoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setError(validation.error || "Archivo inválido");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const logoUrl = await uploadAndSaveUniversityLogo(universityId, selectedFile);
      if (onUploadSuccess) {
        onUploadSuccess(logoUrl);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al subir el logo";
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <strong>Universidad:</strong> {universityName}
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isLoading
            ? 'border-blue-400 bg-blue-50 opacity-60'
            : preview
            ? 'border-green-400 bg-green-50 hover:border-green-600 hover:bg-green-100'
            : 'border-blue-400 bg-blue-50 hover:border-blue-600 hover:bg-blue-100'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-contain rounded-lg mb-3"
            />
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm text-gray-600">Subiendo logo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-10 h-10 text-blue-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Arrastra la imagen aquí o haz clic
            </p>
            <p className="text-xs text-gray-600">
              JPG, PNG o WebP (máx 2MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {preview && !isLoading && (
        <div className="flex justify-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            size="small"
            onClick={handleClear}
          />
          <Button
            label="Subir Logo"
            icon="pi pi-upload"
            size="small"
            className="btn-primary"
            onClick={handleUpload}
          />
        </div>
      )}
    </div>
  );
};
