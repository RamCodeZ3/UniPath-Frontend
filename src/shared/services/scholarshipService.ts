import supabase from "../../config/supabase/supabase";
import type { SB_Scholarship } from "../models/scholarshipsModel";

export const getAllScholarshis = async (): Promise<SB_Scholarship[]> => {
    const { data, error } = await supabase
        .from("scholarships")
        .select("*");

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error}`);

    return data || [];
};

export const getScholarshiById = async (scholarshipId: string) => {
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
    const { data, error } = await supabase.rpc("get_scholarship_with_requirements", {
        p_university_id: scholarshipId,
    });

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error.message}`);

    return data;
};