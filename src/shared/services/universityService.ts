import supabase from "../../config/supabase/supabase";

export const getAllUniversities = async() => {
    const { data, error } = await supabase
    .from("universities")
    .select("*");

    if(!data) throw new Error(`No se pudo obtener los datos`);
    if(error) throw new Error(`Hubo un error obteniendos los datos ${error}`)
    
    return data || [];
}


export const getUniversityFullDetail = async(universityId: string) =>{
    const { data, error } = await supabase
    .rpc(
        'get_university_full_detail',
        { p_university_id: universityId}
    );
    
    if(!data) throw new Error(`No se pudo obtener los datos`);
    if(error) throw new Error(`Hubo un error obteniendos los datos ${error.message}`)
    
    return data;
}