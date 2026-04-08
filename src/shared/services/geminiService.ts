const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const recommendDocuments = async (profileId: string, universityId: string) =>{
    const response = await fetch("https://gdwgsomgtqhtbrxfpggn.supabase.co/functions/v1/document_recommender", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            profile_id: profileId,
            university_id: universityId
        })
        })

        const data = await response.json()
        return data;
}


export const recommendUniversity = async (ask: string) =>{
    const response = await fetch("https://gdwgsomgtqhtbrxfpggn.supabase.co/functions/v1/university_recommendations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            question: ask,
        })
        })

        const data = await response.json()
        return data;
}
