// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

console.log("=== Edge Function Started ===");
console.log("SUPABASE_URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY no está configurada");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

const getDocumentsByProfileId = async (profile_id: string) => {
  console.log("=== getDocumentsByProfileId ===");
  console.log("profile_id:", profile_id);
  console.log("profile_id type:", typeof profile_id);
  
  const { data, error, status } = await supabase
    .from("documents")
    .select("id, document_path, enrollment_requirement_id")
    .eq("profile_id", profile_id)

  console.log("Query status:", status);
  console.log("Query data:", JSON.stringify(data));
  console.log("Query error:", error);

  if (error) {
    console.error("Error en query:", error.message);
    throw new Error("Error obteniendo documentos: " + error.message);
  }
  
  return data || []
}

const getUniversityFullDetail = async (universityId: string) => {
  console.log("=== getUniversityFullDetail ===");
  console.log("universityId:", universityId);
  
  const { data, error, status } = await supabase
    .rpc('get_university_full_detail', { p_university_id: universityId });
    
  console.log("RPC status:", status);
  console.log("RPC error:", error);
    
  if (error) {
    console.error("Error en RPC:", error.message);
    throw new Error(`Hubo un error obteniendo los datos de universidad: ${error.message}`);
  }
  if (!data) throw new Error("No se pudo obtener los datos de la universidad");
  
  return data;
}

const askGemini = async (prompt: string) => {
  console.log("=== askGemini ===");
  console.log("GEMINI_API_KEY exists:", !!GEMINI_API_KEY);
  console.log("GEMINI_API_KEY prefix:", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + "..." : "null");
  
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno");
  }
  
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  )

  console.log("Gemini response status:", res.status);

  if (!res.ok) {
    const errorBody = await res.json()
    throw new Error(`Error Gemini ${res.status}: ${JSON.stringify(errorBody)}`)
  }

  const json = await res.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sin respuesta"
  console.log("Gemini response text length:", text.length);
  
  return text
}

Deno.serve(async (req) => {
  console.log("=== Deno.serve invoked ===");
  console.log("Method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));
    
    const { profile_id, university_id } = body;

    console.log("profile_id:", profile_id);
    console.log("university_id:", university_id);

    if (!profile_id || !university_id) {
      console.error("Faltan parámetros requeridos");
      return new Response(
        JSON.stringify({ error: "profile_id y university_id son requeridos" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    console.log("Llamando getDocumentsByProfileId...");
    const documents = await getDocumentsByProfileId(profile_id);
    console.log("Documents fetched successfully, count:", documents.length);
    
    console.log("Llamando getUniversityFullDetail...");
    const university = await getUniversityFullDetail(university_id);
    console.log("University fetched successfully");

    const context = documents.map((doc: any) => {
      const fileName = doc.document_path.split('/').pop() || 'Documento';
      return `- ${fileName} (Requisito ID: ${doc.enrollment_requirement_id || 'No especificado'})`;
    }).join("\n")

    const prompt = `
      Eres un asistente especializado en admisiones universitarias. Tu tarea es analizar los documentos del usuario y compararlos con los requisitos de la universidad seleccionada.

      DOCUMENTOS DEL USUARIO:
      ${context || "El usuario no tiene documentos cargados."}

      Si el usuario no tiene documentos cargados, responde únicamente: "Debes subir tus documentos para poder continuar con el proceso."

      UNIVERSIDAD Y REQUISITOS:
      ${JSON.stringify(university, null, 2)}

      INSTRUCCIONES:
      Compara los documentos disponibles del usuario con los requisitos exigidos por la universidad. Luego genera un análisis claro y estructurado que incluya:

      1. **Documentos presentados:** Lista los documentos que el usuario ya tiene cargados.
      2. **Documentos faltantes:** Indica cuáles documentos requeridos por la universidad aún no han sido proporcionados.
      3. **Documentos adicionales (si aplica):** Menciona si el usuario tiene documentos que no son requeridos.
      4. **Estado general:** Indica si el usuario está completo, incompleto o parcialmente listo para aplicar.
      5. **Recomendación:** Da una sugerencia concreta sobre los próximos pasos a seguir.

      Sé directo, claro y útil. No repitas información innecesaria.
      `;

    console.log("Llamando askGemini...");
    const answer = await askGemini(prompt);
    console.log("Gemini answered successfully");

    return new Response(
      JSON.stringify({ answer, documents_used: documents.length }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("=== ERROR CATCH ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  }
})
