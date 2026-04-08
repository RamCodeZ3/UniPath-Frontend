import supabase from "../../config/supabase/supabase";
import type { SB_Documents } from "../models/documentModel";

const BUCKET_NAME = "documents_users";

/**
 * Obtiene todos los documentos de un usuario
 * @param profileId - ID del perfil del usuario
 * @returns Array de documentos
 */
export const getAllDocumentsByProfileId = async (profileId: string): Promise<SB_Documents[]> => {
    if (!profileId) throw new Error("El profileId es requerido");

    const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("profile_id", profileId);

    if (error) throw new Error(`Error al obtener documentos: ${error.message}`);

    return data || [];
};

/**
 * Crea un nuevo documento en la BD
 * @param document - Datos del documento
 * @returns El documento creado
 */
export const createDocument = async (
    document: Omit<SB_Documents, 'id' | 'created_at'>,
): Promise<SB_Documents> => {
    if (!document.profile_id) throw new Error("El profile_id es requerido");
    if (!document.document_path) throw new Error("El document_path es requerido");

    const { data, error } = await supabase
        .from('documents')
        .insert(document)
        .select('*')
        .single();

    if (error) {
        throw new Error(`Error al crear documento: ${error.message}`);
    }

    if (!data) {
        throw new Error('No se pudo crear el documento - respuesta vacía');
    }

    return data;
};

/**
 * Sube un archivo a Supabase Storage
 * @param profileId - ID del perfil del usuario
 * @param file - Archivo a subir
 * @param fileName - Nombre del archivo (opcional)
 * @returns URL pública del archivo
 */
export const uploadDocument = async (
    profileId: string,
    file: File | Blob,
    fileName?: string
): Promise<string> => {
    if (!profileId) throw new Error("El profileId es requerido");
    if (!file) throw new Error("El archivo es requerido");

    const resolvedFileName =
        fileName ?? (file instanceof File ? file.name : `file_${Date.now()}`);

    const filePath = `${profileId}/${resolvedFileName}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            upsert: true,
            contentType: file instanceof File ? file.type : "application/octet-stream",
        });

    if (uploadError) throw new Error(`Error al subir archivo: ${uploadError.message}`);

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    if (!urlData?.publicUrl) throw new Error("No se pudo obtener la URL pública del archivo");

    return urlData.publicUrl;
};

/**
 * Elimina un documento (archivo + registro en BD)
 * @param documentId - ID del documento a eliminar
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
    if (!documentId) throw new Error("El documentId es requerido");

    // Obtener el documento para extraer el document_path
    const { data, error: getError } = await supabase
        .from("documents")
        .select("document_path")
        .eq("id", documentId)
        .single();

    if (getError) throw new Error(`Error al obtener documento: ${getError.message}`);
    if (!data) throw new Error(`Documento no encontrado: ${documentId}`);

    // Eliminar archivo del storage
    const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([data.document_path]);

    if (storageError) throw new Error(`Error al eliminar archivo: ${storageError.message}`);

    // Eliminar registro de la BD
    const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

    if (deleteError) throw new Error(`Error al eliminar documento: ${deleteError.message}`);
};