import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { documentText, imageData, isImage, documentType } = await req.json();

    if (!documentText && !imageData) {
      return new Response(
        JSON.stringify({ error: "Document text or image data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured in Supabase secrets" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const promptText = `Tu es un expert maritime. Analyse ${isImage ? "cette image" : "ce document"} et extrais TOUTES les informations sur le navire que tu peux trouver.

${!isImage ? `CONTENU DU DOCUMENT:\n${documentText}\n\n` : ""}

IMPORTANT:
- Cherche attentivement toutes les informations même si elles sont partielles
- Si tu trouves des informations, remplis les champs correspondants
- Si une information n'est vraiment pas présente, utilise null
- Pour le contexte historique, résume ce que tu trouves dans le document en 2-3 phrases

INSTRUCTIONS DE RÉPONSE:
- Réponds UNIQUEMENT avec du JSON valide
- PAS de texte avant ou après le JSON
- PAS de balises markdown comme \`\`\`json
- Utilise null (sans guillemets) pour les valeurs non trouvées

Format JSON à retourner:
{
  "vessel_name": "nom exact du navire ou null",
  "vessel_type": "cargo, tanker, container_ship, yacht, trawler, tugboat, barge, ferry, fishing_vessel, passenger_ship, ou other",
  "imo_number": "numéro IMO complet ou null",
  "flag": "pays du pavillon ou null",
  "port": "port d'attache ou null",
  "owner": "nom de l'armateur/propriétaire ou null",
  "year_built": "année de construction (nombre) ou null",
  "builder": "nom du chantier naval ou null",
  "length": nombre en mètres ou null,
  "beam": nombre en mètres ou null,
  "draft": nombre en mètres ou null,
  "gross_tonnage": nombre GT ou null,
  "net_tonnage": nombre NT ou null,
  "deadweight": nombre DWT ou null,
  "main_engine": "description du moteur principal ou null",
  "classification_society": "nom de la société de classification ou null",
  "historical_context": "résumé en 2-3 phrases du contexte et informations importantes du document ou null"
}`;

    const messageContent = isImage
      ? [
          {
            type: "text",
            text: promptText,
          },
          {
            type: "image_url",
            image_url: {
              url: imageData,
            },
          },
        ]
      : promptText;

    const requestBody = {
      model: isImage ? "openai/gpt-4o-mini" : "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en extraction d'informations maritimes. Tu analyses des documents et images pour identifier les caractéristiques techniques des navires."
        },
        {
          role: "user",
          content: messageContent,
        },
      ],
      temperature: 0.2,
    };

    console.log("OpenRouter Request:", {
      model: requestBody.model,
      isImage,
      documentTextLength: documentText?.length || 0,
      hasImageData: !!imageData,
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://expertise-maritime.app",
        "X-Title": "Maritime Expertise",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("OpenRouter Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error Response:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      return new Response(
        JSON.stringify({ error: "Failed to extract information from document" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("OpenRouter Response Data:", {
      model: data.model,
      usage: data.usage,
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
    });

    const extractedText = data.choices[0]?.message?.content;
    console.log("Extracted Text from AI:", extractedText?.substring(0, 200) + "...");

    if (!extractedText) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let extractedInfo;
    try {
      let cleanedText = extractedText.trim();

      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Try to extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedInfo = JSON.parse(jsonMatch[0]);
      } else {
        extractedInfo = JSON.parse(cleanedText);
      }

      // Clean up null strings
      Object.keys(extractedInfo).forEach(key => {
        if (extractedInfo[key] === 'null' || extractedInfo[key] === 'NULL') {
          extractedInfo[key] = null;
        }
      });

      console.log("Successfully Parsed JSON:", extractedInfo);

    } catch (parseError) {
      console.error("JSON Parse Error:", {
        error: parseError.message,
        extractedText,
      });
      return new Response(
        JSON.stringify({ error: "Failed to parse extracted information", raw: extractedText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedInfo }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in extract-vessel-info:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});