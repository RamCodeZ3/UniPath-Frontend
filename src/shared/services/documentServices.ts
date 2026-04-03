import supabase from "../../config/supabase/supabase";
import type { SB_Documents } from "../models/documentModel";

const BUCKET_NAME = "documents_users";

export const getAllDocumentsByProfileId = async(profileId: string) => {
    const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("profile_id", profileId)

    if(!data) throw new Error("Humbu un error obteniendo los datos");
    if (error) throw new Error(`Error al obtener los documentos ${error}`);

    return data || [];
}


export const createDocument = async (
  document: Partial<SB_Documents>,
) => {
  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select('*')
    .single();

  if (error) throw new Error(`Error al crear el documento ${error.message}`);
  if (!data) throw new Error('No se pudo crear el documento');

  return data;
};


export const deleteDocument = async (documentId: string): Promise<void> => {
  const { data, error} = await supabase
    .from("documents")
    .select("document_path")
    .eq("id", documentId)
    .single();
 
  if (error) throw new Error("Error al obtener el documento: " + error.message);
  if (!data) throw new Error(`No se encontró el documento con id: ${documentId}`);
 
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([data.document_path]);
 
  if (storageError) throw new Error("Error al eliminar el archivo del storage: " + storageError.message);
 
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);
 
  if (deleteError) throw new Error("Error al eliminar el registro del documento: " + deleteError.message);
};


export const uploadDocument = async(
  profileId: string,
  file: File | Blob,
  fileName?: string
): Promise<string> => {
  
    if (!profileId) throw new Error("El profileId es requerido.");
    if (!file) throw new Error("El archivo es requerido.");

  const resolvedFileName =
    fileName ?? (file instanceof File ? file.name : `file_${Date.now()}`);

  const filePath = `${profileId}/${resolvedFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file instanceof File ? file.type : "application/octet-stream",
    });

  if (uploadError) throw new Error(`Error al subir el archivo: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) throw new Error("No se pudo obtener la URL pública del archivo.");

  return urlData.publicUrl;
}