import supabase from "../../config/supabase/supabase";
import type { SB_University, UniversityFilters, UniversityWithDetails } from "../models/universityModel";

export const getAllUniversities = async (): Promise<SB_University[]> => {
    const { data, error } = await supabase
        .from("universities")
        .select("*");

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error}`);

    return data || [];
};

export const getUniversitiesWithFilters = async (
    filters: UniversityFilters
): Promise<{ data: SB_University[]; total: number }> => {
    let query = supabase.from("universities").select("*", { count: 'exact' });

    if (filters.type) {
        query = query.eq("type", filters.type);
    }

    if (filters.modality && filters.modality.length > 0) {
        query = query.in("modality", filters.modality);
    }

    if (filters.accredited !== null && filters.accredited !== undefined) {
        query = query.eq("accredited", filters.accredited);
    }

    if (filters.status) {
        query = query.eq("status", filters.status);
    }

    if (filters.search) {
        query = query.or(
            `name.ilike.%${filters.search}%,acronym.ilike.%${filters.search}%`
        );
    }

    const limit = filters.limit || 12;
    const page = filters.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(`Error al filtrar universidades: ${error.message}`);

    return {
        data: data || [],
        total: count || 0
    };
};

export const getUniversitiesForForeigners = async (): Promise<string[]> => {
    const { data: foreignerReqs, error: reqError } = await supabase
        .from("enrollment_requirements")
        .select("id")
        .eq("applies_to_foreigners", true);

    if (reqError) {
        console.error("Error al obtener requisitos de extranjeros:", reqError);
        return [];
    }

    if (!foreignerReqs || foreignerReqs.length === 0) {
        return [];
    }

    const requirementIds = foreignerReqs.map((r) => r.id);

    const { data: uniReqs, error: uniError } = await supabase
        .from("university_requirements")
        .select("university_id")
        .in("requirement_id", requirementIds);

    if (uniError) {
        console.error("Error al obtener universidades con requisitos:", uniError);
        return [];
    }

    const uniqueIds = [...new Set(uniReqs?.map((r) => r.university_id) || [])];
    return uniqueIds;
};

export const getUniversityFullDetail = async (
    universityId: string
): Promise<UniversityWithDetails> => {
    const { data, error } = await supabase.rpc("get_university_full_detail", {
        p_university_id: universityId,
    });

    if (!data) throw new Error(`No se pudo obtener los datos`);
    if (error) throw new Error(`Hubo un error obteniendo los datos ${error.message}`);

    return data;
};

export const getUniversityWithRequirements = async (
    universityId: string
): Promise<UniversityWithDetails | null> => {

    const { data: university, error: uniError } = await supabase
        .from("universities")
        .select("*")
        .eq("id", universityId)
        .single();

    if (uniError) throw new Error(`Error al obtener universidad: ${uniError.message}`);
    if (!university) return null;

    const { data: universityReqs } = await supabase
        .from("university_requirements")
        .select(`
            id,
            university_id,
            requirement_id,
            notas,
            enrollment_requirements (
                id,
                description,
                validity,
                who_can_apply,
                accepted_format,
                applies_to_foreigners
            )
        `)
        .eq("university_id", universityId);

    const transformedReqs = universityReqs?.map((req: any) => ({
        id: req.id,
        university_id: req.university_id,
        requirement_id: req.requirement_id,
        notas: req.notas,
        enrollment_requirement: req.enrollment_requirements,
    })) || [];

    const { data: overviews } = await supabase
        .from("university_overviews")
        .select("id, comment, profile_id")
        .eq("university_id", universityId);

    return {
        ...university,
        university_requirements: transformedReqs,
        overviews: overviews || [],
    };
};