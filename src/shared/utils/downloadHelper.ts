export const downloadFile = (publicUrl: string, fileName: string) => {
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

export const downloadBlob = (blob: Blob, fileName: string) => {
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

export const openFileInNewTab = (publicUrl: string) => {
  try {
    window.open(publicUrl, '_blank');
  } catch (error) {
    console.error('Error al abrir archivo:', error);
    throw new Error('No se pudo abrir el archivo');
  }
}

export const copyToClipboard = async(url: string) => {
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    throw new Error('No se pudo copiar la URL');
  }
}
