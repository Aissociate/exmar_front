import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { audio_id } = await req.json();

    if (!audio_id) {
      throw new Error("Missing audio_id");
    }

    const { data: audioRecord, error: fetchError } = await supabase
      .from("questionnaire_audio")
      .select("transcription, question_id")
      .eq("id", audio_id)
      .single();

    if (fetchError || !audioRecord) {
      throw new Error(`Failed to fetch audio record: ${fetchError?.message}`);
    }

    if (!audioRecord.transcription) {
      throw new Error("No transcription available for analysis");
    }

    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!openrouterApiKey) {
      console.warn("OPENROUTER_API_KEY not configured, using mock analysis");

      const mockAnalysis = "Analyse par IA non disponible. Veuillez configurer OPENROUTER_API_KEY pour activer cette fonctionnalité.";

      const { error: updateError } = await supabase
        .from("questionnaire_audio")
        .update({
          ai_analysis: mockAnalysis,
          ai_analysis_status: "completed",
        })
        .eq("id", audio_id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          analysis: mockAnalysis,
          mock: true,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openrouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterApiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-audio-preview",
          messages: [
            {
              role: "user",
              content: `Tu es un expert maritime spécialisé dans l'analyse de commentaires d'expertise. Ton rôle est d'analyser les transcriptions audio des experts et d'en extraire les informations importantes : observations techniques, problèmes identifiés, recommandations, et tout élément pertinent pour un rapport d'expertise maritime. Sois concis, précis et professionnel.

Analyse cette transcription audio d'un expert maritime et extrais les points clés, observations techniques, et recommandations pertinentes :

"${audioRecord.transcription}"

Fournis une analyse structurée et professionnelle.`
            }
          ]
        })
      }
    );

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const result = await openrouterResponse.json();
    const analysis = result.choices?.[0]?.message?.content || "";

    const { error: updateError } = await supabase
      .from("questionnaire_audio")
      .update({
        ai_analysis: analysis,
        ai_analysis_status: "completed",
      })
      .eq("id", audio_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in analyze-audio:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
