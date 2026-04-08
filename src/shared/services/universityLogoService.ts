import supabase from "../../config/supabase/supabase";

const BUCKET_NAME = "university_logos";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface UploadLogoResult {
  logoUrl: string;
  fileName: string;
}

export const validateLogoFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Solo se permiten archivos JPG, PNG o WebP" };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: `El archivo debe ser menor a ${MAX_SIZE_MB}MB` };
  }

  return { valid: true };
};

export const uploadUniversityLogo = async (
  universityId: string,
  file: File
): Promise<UploadLogoResult> => {
  if (!universityId) throw new Error("El universityId es requerido");
  if (!file) throw new Error("El archivo es requerido");

  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split(".").pop() || "png";
  const fileName = `${universityId}.${fileExtension}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Error al subir logo: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error("No se pudo obtener la URL pública del logo");
  }

  return {
    logoUrl: urlData.publicUrl,
    fileName: fileName,
  };
};

export const updateUniversityLogoInDb = async (
  universityId: string,
  logoUrl: string
): Promise<void> => {
  if (!universityId) throw new Error("El universityId es requerido");
  if (!logoUrl) throw new Error("La logoUrl es requerida");

  const { error } = await supabase
    .from("universities")
    .update({ logo_url: logoUrl })
    .eq("id", universityId);

  if (error) {
    throw new Error(`Error al actualizar logo en base de datos: ${error.message}`);
  }
};

export const uploadAndSaveUniversityLogo = async (
  universityId: string,
  file: File
): Promise<string> => {
  const { logoUrl } = await uploadUniversityLogo(universityId, file);
  await updateUniversityLogoInDb(universityId, logoUrl);
  return logoUrl;
};
