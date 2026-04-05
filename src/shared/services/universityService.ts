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

// Obtener universidades con filtros
export const getUniversitiesWithFilters = async (
    filters: UniversityFilters
): Promise<SB_University[]> => {
    let query = supabase.from("universities").select("*");

    // Filtro por tipo
    if (filters.type) {
        query = query.eq("type", filters.type);
    }

    // Filtro por modalidad (múltiple)
    if (filters.modality && filters.modality.length > 0) {
        query = query.in("modality", filters.modality);
    }

    // Filtro por acreditación
    if (filters.accredited !== null && filters.accredited !== undefined) {
        query = query.eq("accredited", filters.accredited);
    }

    // Filtro por estado
    if (filters.status) {
        query = query.eq("status", filters.status);
    }

    // Filtro por búsqueda de texto
    if (filters.search) {
        query = query.or(
            `name.ilike.%${filters.search}%,acronym.ilike.%${filters.search}%`
        );
    }

    const { data, error } = await query;

    if (error) throw new Error(`Error al filtrar universidades: ${error.message}`);

    return data || [];
};

// Obtener IDs de universidades que aceptan extranjeros
// Relación: universities <- university_requirements -> enrollment_requirements
export const getUniversitiesForForeigners = async (): Promise<string[]> => {
    // Primero obtener los IDs de enrollment_requirements que aplican a extranjeros
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

    // Luego obtener los university_ids que tienen esos requisitos
    const { data: uniReqs, error: uniError } = await supabase
        .from("university_requirements")
        .select("university_id")
        .in("requirement_id", requirementIds);

    if (uniError) {
        console.error("Error al obtener universidades con requisitos:", uniError);
        return [];
    }

    // Retornar IDs únicos
    const uniqueIds = [...new Set(uniReqs?.map((r) => r.university_id) || [])];
    return uniqueIds;
};

// Obtener detalle completo de una universidad
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

// Obtener universidad por ID con requisitos
export const getUniversityWithRequirements = async (
    universityId: string
): Promise<UniversityWithDetails | null> => {
    // Obtener universidad base
    const { data: university, error: uniError } = await supabase
        .from("universities")
        .select("*")
        .eq("id", universityId)
        .single();

    if (uniError) throw new Error(`Error al obtener universidad: ${uniError.message}`);
    if (!university) return null;

    // Obtener requisitos de la universidad con la relación a enrollment_requirements
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

    // Transformar la respuesta para aplanar enrollment_requirements
    const transformedReqs = universityReqs?.map((req: any) => ({
        id: req.id,
        university_id: req.university_id,
        requirement_id: req.requirement_id,
        notas: req.notas,
        enrollment_requirement: req.enrollment_requirements,
    })) || [];

    // Obtener overviews/comentarios
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