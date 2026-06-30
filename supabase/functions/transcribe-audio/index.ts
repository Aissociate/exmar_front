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

    const { audio_id, storage_path } = await req.json();

    if (!audio_id || !storage_path) {
      throw new Error("Missing audio_id or storage_path");
    }

    console.log(`Downloading audio from storage: ${storage_path}`);

    const { data: audioFile, error: downloadError } = await supabase.storage
      .from("questionnaire-media")
      .download(storage_path);

    if (downloadError || !audioFile) {
      throw new Error(`Failed to download audio: ${downloadError?.message}`);
    }

    console.log(`Audio file downloaded successfully, size: ${audioFile.size} bytes`);

    // Check for OpenAI API key for direct Whisper API access
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      console.warn("OPENAI_API_KEY not configured, using mock transcription");

      const mockTranscription = "Transcription automatique non disponible. Veuillez configurer OPENAI_API_KEY pour activer cette fonctionnalité.";

      const { error: updateError } = await supabase
        .from("questionnaire_audio")
        .update({
          transcription: mockTranscription,
          transcription_status: "completed",
        })
        .eq("id", audio_id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          transcription: mockTranscription,
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

    console.log("Preparing audio for transcription...");
    console.log(`Audio MIME type: ${audioFile.type}, size: ${audioFile.size} bytes`);

    // Use OpenAI Whisper API directly (supports WebM natively)
    const formData = new FormData();
    formData.append("file", audioFile, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "fr");
    formData.append("prompt", "Il s'agit d'un commentaire d'expertise maritime contenant des termes techniques nautiques.");

    console.log("Calling OpenAI Whisper API...");

    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: formData,
      }
    );

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("OpenAI Whisper error:", errorText);
      throw new Error(`OpenAI Whisper API error: ${errorText}`);
    }

    const result = await whisperResponse.json();
    const transcription = result.text || "";
    console.log("Transcription result:", transcription);

    console.log(`Updating database with transcription for audio_id: ${audio_id}`);

    const { error: updateError } = await supabase
      .from("questionnaire_audio")
      .update({
        transcription,
        transcription_status: "completed",
      })
      .eq("id", audio_id);

    if (updateError) {
      throw updateError;
    }

    console.log("Transcription completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        transcription,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in transcribe-audio:", error);

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