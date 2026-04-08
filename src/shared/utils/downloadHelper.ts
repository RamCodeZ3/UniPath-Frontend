/**
 * Descarga un archivo desde una URL pública
 * @param publicUrl - URL pública del archivo
 * @param fileName - Nombre del archivo para la descarga
 */
export function downloadFile(publicUrl: string, fileName: string): void {
  try {
    const link = document.createElement('a');
    link.href = publicUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw new Error('No se pudo descargar el archivo');
  }
}

/**
 * Descarga un archivo desde un blob
 * @param blob - Blob del archivo
 * @param fileName - Nombre del archivo para la descarga
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar blob:', error);
    throw new Error('No se pudo descargar el archivo');
  }
}

/**
 * Abre un archivo en una nueva ventana
 * @param publicUrl - URL pública del archivo
 */
export function openFileInNewTab(publicUrl: string): void {
  try {
    window.open(publicUrl, '_blank');
  } catch (error) {
    console.error('Error al abrir archivo:', error);
    throw new Error('No se pudo abrir el archivo');
  }
}

/**
 * Copia una URL al portapapeles
 * @param url - URL a copiar
 */
export async function copyToClipboard(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    throw new Error('No se pudo copiar la URL');
  }
}
