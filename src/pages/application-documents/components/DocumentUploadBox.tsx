import { useRef } from 'react';

interface DocumentUploadBoxProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const DocumentUploadBox = ({
  onUpload,
  isLoading,
}: DocumentUploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
        isLoading
          ? 'border-blue-400 bg-blue-50 opacity-60'
          : 'border-blue-400 bg-blue-50 hover:border-blue-600 hover:bg-blue-100'
      }`}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="hidden"
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Procesando archivo...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Arrastra tu archivo aquí o haz clic
          </p>
          <p className="text-xs text-gray-600">
            PDF, JPG, PNG o GIF (máx 20MB)
          </p>
        </div>
      )}
    </div>
  );
};
