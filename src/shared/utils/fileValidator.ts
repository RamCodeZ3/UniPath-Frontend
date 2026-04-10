const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export const validateFile = (file: File): FileValidation => {
  if (!file) {
    return { valid: false, error: 'No se proporcionó ningún archivo' };
  }

  // Validar extensión
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Formatos aceptados: PDF, JPG, PNG, GIF`,
    };
  }

  // Validar MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `El tipo MIME del archivo no es permitido`,
    };
  }

  return { valid: true };
}

export const getFileExtension = (fileName: string): string => {
  if (!fileName) return '';
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.substring(lastDot).toLowerCase();
}

export const getFileMimeType = (file: File): string => {
  return file.type || 'application/octet-stream';
}

export const generateUniqueFileName = (fileName: string, existingNames: string[]): string => {
  if (!fileName) return '';
  
  if (!existingNames.includes(fileName)) {
    return fileName;
  }

  const extension = getFileExtension(fileName);
  const lastDotIndex = fileName.lastIndexOf('.');
  const nameWithoutExtension = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

  let counter = 1;
  let newName = `${nameWithoutExtension} (${counter})${extension}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${nameWithoutExtension} (${counter})${extension}`;
  }

  return newName;
}

export const getFileType = (fileName: string): 'pdf' | 'image' => {
  const extension = getFileExtension(fileName).toLowerCase();
  if (extension === '.pdf') return 'pdf';
  return 'image';
}

export const getFileTypeLabel = (fileName: string): string => {
  const extension = getFileExtension(fileName).toLowerCase();
  const labels: Record<string, string> = {
    '.pdf': 'PDF',
    '.jpg': 'JPG',
    '.jpeg': 'JPG',
    '.png': 'PNG',
    '.gif': 'GIF',
  };
  return labels[extension] || 'Archivo';
}
