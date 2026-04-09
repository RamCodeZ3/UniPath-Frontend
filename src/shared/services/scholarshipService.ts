import supabase from "../../config/supabase/supabase";
import type { SB_Scholarship } from "../models/scholarshipsModel";

export const getAllScholarships = async (): Promise<SB_Scholarship[]> => {
    const { data, error } = await supabase
        .from("scholarships")
        .select("*");

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error}`);

    return data || [];
};

export const getScholarshipById = async (scholarshipId: string): Promise<SB_Scholarship> => {
    const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("id", scholarshipId)
        .single();

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error}`);

    return data;
};

export const getScholarshipFullDetail = async (
    scholarshipId: string
) => {
    const tryNewParam = await supabase.rpc("get_scholarship_with_requirements", {
        p_scholarship_id: scholarshipId,
    });

    if (!tryNewParam.error && tryNewParam.data) {
        return tryNewParam.data;
    }

    const tryLegacyParam = await supabase.rpc("get_scholarship_with_requirements", {
        p_university_id: scholarshipId,
    });

    const { data, error } = tryLegacyParam;

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error.message}`);

    return data;
};

// Backward compatibility for existing imports
export const getAllScholarshis = getAllScholarships;
export const getScholarshiById = getScholarshipById;
