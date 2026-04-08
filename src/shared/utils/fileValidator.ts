// Tipos de archivo permitidos
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

/**
 * Valida que un archivo tenga la extensión correcta y sea de un tipo permitido
 * @param file - Archivo a validar
 * @returns Objeto con validez y mensaje de error opcional
 */
export function validateFile(file: File): FileValidation {
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

/**
 * Obtiene la extensión de un archivo
 * @param fileName - Nombre del archivo
 * @returns Extensión del archivo (ej: '.pdf')
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.substring(lastDot).toLowerCase();
}

/**
 * Obtiene el tipo MIME de un archivo
 * @param file - Archivo del cual obtener el tipo
 * @returns Tipo MIME (ej: 'application/pdf')
 */
export function getFileMimeType(file: File): string {
  return file.type || 'application/octet-stream';
}

/**
 * Genera un nombre único para un archivo si ya existe uno con el mismo nombre
 * @param fileName - Nombre original del archivo
 * @param existingNames - Lista de nombres existentes
 * @returns Nombre único
 */
export function generateUniqueFileName(fileName: string, existingNames: string[]): string {
  if (!existingNames.includes(fileName)) {
    return fileName;
  }

  const extension = getFileExtension(fileName);
  const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));

  let counter = 1;
  let newName = `${nameWithoutExtension} (${counter})${extension}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${nameWithoutExtension} (${counter})${extension}`;
  }

  return newName;
}

/**
 * Obtiene el tipo de icono según la extensión del archivo
 * @param fileName - Nombre del archivo
 * @returns Tipo de icono ('pdf' | 'image')
 */
export function getFileType(fileName: string): 'pdf' | 'image' {
  const extension = getFileExtension(fileName).toLowerCase();
  if (extension === '.pdf') return 'pdf';
  return 'image';
}

/**
 * Obtiene un icono legible del archivo
 * @param fileName - Nombre del archivo
 * @returns Tipo de archivo legible
 */
export function getFileTypeLabel(fileName: string): string {
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
