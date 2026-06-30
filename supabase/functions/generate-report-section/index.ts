import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExpertProfile {
  full_name: string;
  title: string;
  address: string;
  phone: string;
  email: string;
  registration_number?: string;
  qualifications?: string;
}

interface GenerateSectionRequest {
  section: 'expert_presentation' | 'identification' | 'contexte' | 'constatations' | 'analyse' | 'estimation';
  customPrompt?: string;
  expertProfile?: ExpertProfile;
  dossierData: {
    vessel_name?: string;
    vessel_type?: string;
    imo_number?: string;
    flag?: string;
    port?: string;
    owner?: string;
    incident_date?: string;
    inspection_date?: string;
    notes?: string;
  };
  historicalContext?: string;
  questionnaireAnswers?: Array<{
    question: string;
    answer: any;
    photos?: string[];
  }>;
  photos?: Array<{
    url: string;
    caption?: string;
    checkpoint?: string;
  }>;
  previousSections?: {
    expert_presentation?: string;
    identification?: string;
    contexte?: string;
    constatations?: string;
    analyse?: string;
  };
  estimationMethod?: {
    method: 'cost_based' | 'market_based' | 'depreciation';
    baseValue?: number;
    depreciation?: number;
    repairCosts?: Array<{
      item: string;
      quantity: number;
      unitCost: number;
      total: number;
    }>;
  };
}

const SECTION_PROMPTS = {
  expert_presentation: `You are a maritime expert writing the EXPERT PRESENTATION section at the beginning of an expertise report.

Based on the expert profile information provided, write a professional presentation section in French that includes:
- Full name and professional title
- Professional registration number if applicable
- Contact information (address, phone, email)
- Professional qualifications and certifications
- Areas of expertise and specializations
- Professional background and experience

This section should establish the expert's credentials and authority to conduct the maritime expertise.
Format the response as professional report text with clear paragraphs. Use formal language in French.`,

  identification: `You are a maritime expert writing the IDENTIFICATION section of an expertise report.

Based on the vessel data provided, write a comprehensive identification section in French that includes:
- Complete vessel identification (name, type, IMO number)
- Flag and port of registry
- Owner information
- Technical specifications from historical documents
- Any relevant certifications or classifications

Format the response as professional report text with clear paragraphs. Use formal maritime terminology in French.`,

  contexte: `You are a maritime expert writing the CONTEXTE (Context) section of an expertise report.

Based on the dossier data, historical context, and identification section, write a comprehensive context section in French that includes:
- Circumstances of the incident or inspection request
- Date and location of incident
- Initial observations
- Relevant historical information about the vessel
- Previous incidents or repairs if mentioned in historical context

Format the response as professional report text with clear paragraphs.`,

  constatations: `You are a maritime expert writing the CONSTATATIONS (Findings) section of an expertise report.

Based on the questionnaire answers and photos provided, write a comprehensive findings section in French that includes:
- Detailed description of observations at each checkpoint/question
- **IMPORTANT: Insert actual photo HTML after each relevant observation**
- Measurements and technical observations
- Condition assessment of equipment and structures
- List of damages or deficiencies identified

For each question/checkpoint with photos:
1. Write the observation/finding
2. IMMEDIATELY after, insert ALL related photos using this EXACT HTML format for EACH photo:

<div style="margin: 20px 0; page-break-inside: avoid;">
  <img src="PHOTO_URL" alt="CAPTION" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px;" />
  <p style="margin-top: 8px; font-size: 14px; color: #64748b; font-style: italic;">Figure X: CAPTION</p>
</div>

Replace PHOTO_URL with the actual photo URL, CAPTION with the photo caption, and X with the figure number.
ALWAYS include photos right after their related observation.`,

  analyse: `You are a maritime expert writing the ANALYSE (Analysis) section of an expertise report.

Based on the findings, context, and identification sections, write a comprehensive analysis in French that includes:
- Technical interpretation of the findings
- Root cause analysis if applicable
- Severity assessment of damages or deficiencies
- Compliance with maritime regulations
- Impact on vessel operations
- Recommendations for repairs or actions

Format the response as professional report text with clear paragraphs and bullet points where appropriate.`,

  estimation: `You are a maritime expert writing the ESTIMATION section of an expertise report.

Based on the analysis, findings, and estimation method provided, write a comprehensive estimation section in French that includes:
- Estimation methodology explanation
- Detailed breakdown of repair costs
- Material and labor costs
- Total estimated cost with justification
- Timeline for repairs if applicable
- Alternative scenarios if relevant

If repair costs are provided, present them in a clear table format using markdown.
Format the response as professional report text with clear structure.`,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      section,
      customPrompt,
      expertProfile,
      dossierData,
      historicalContext,
      questionnaireAnswers,
      photos,
      previousSections,
      estimationMethod,
    }: GenerateSectionRequest = await req.json();

    console.log('Generating section:', section);
    console.log('Custom prompt:', customPrompt ? 'Yes' : 'No');

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Use custom prompt if provided, otherwise use default
    let basePrompt = SECTION_PROMPTS[section];
    if (customPrompt && customPrompt.trim()) {
      basePrompt = `${SECTION_PROMPTS[section]}\n\nADDITIONAL INSTRUCTIONS FROM USER:\n${customPrompt}`;
    }

    let contextText = `${basePrompt}\n\n`;

    if (section === 'expert_presentation' && expertProfile) {
      contextText += `EXPERT PROFILE:\n`;
      contextText += `Name: ${expertProfile.full_name}\n`;
      contextText += `Title: ${expertProfile.title}\n`;
      if (expertProfile.registration_number) {
        contextText += `Registration Number: ${expertProfile.registration_number}\n`;
      }
      contextText += `Address: ${expertProfile.address}\n`;
      contextText += `Phone: ${expertProfile.phone}\n`;
      contextText += `Email: ${expertProfile.email}\n`;
      if (expertProfile.qualifications) {
        contextText += `Qualifications: ${expertProfile.qualifications}\n`;
      }
      contextText += `\n`;
    }

    contextText += `DOSSIER DATA:\n`;
    contextText += `Vessel Name: ${dossierData.vessel_name || 'N/A'}\n`;
    contextText += `Vessel Type: ${dossierData.vessel_type || 'N/A'}\n`;
    contextText += `IMO Number: ${dossierData.imo_number || 'N/A'}\n`;
    contextText += `Flag: ${dossierData.flag || 'N/A'}\n`;
    contextText += `Port: ${dossierData.port || 'N/A'}\n`;
    contextText += `Owner: ${dossierData.owner || 'N/A'}\n`;
    contextText += `Incident Date: ${dossierData.incident_date || 'N/A'}\n`;
    contextText += `Inspection Date: ${dossierData.inspection_date || 'N/A'}\n`;
    if (dossierData.notes) {
      contextText += `Notes: ${dossierData.notes}\n`;
    }
    contextText += `\n`;

    if (historicalContext) {
      contextText += `HISTORICAL CONTEXT:\n${historicalContext}\n\n`;
    }

    if (previousSections) {
      if (previousSections.expert_presentation) {
        contextText += `PREVIOUS SECTION - EXPERT PRESENTATION:\n${previousSections.expert_presentation}\n\n`;
      }
      if (previousSections.identification) {
        contextText += `PREVIOUS SECTION - IDENTIFICATION:\n${previousSections.identification}\n\n`;
      }
      if (previousSections.contexte) {
        contextText += `PREVIOUS SECTION - CONTEXTE:\n${previousSections.contexte}\n\n`;
      }
      if (previousSections.constatations) {
        contextText += `PREVIOUS SECTION - CONSTATATIONS:\n${previousSections.constatations}\n\n`;
      }
      if (previousSections.analyse) {
        contextText += `PREVIOUS SECTION - ANALYSE:\n${previousSections.analyse}\n\n`;
      }
    }

    if (questionnaireAnswers && questionnaireAnswers.length > 0) {
      contextText += `QUESTIONNAIRE ANSWERS WITH PHOTOS:\n`;
      questionnaireAnswers.forEach((qa, index) => {
        contextText += `\nQ${index + 1}: ${qa.question}\n`;
        contextText += `A${index + 1}: ${JSON.stringify(qa.answer)}\n`;

        // Find photos for this question
        const questionPhotos = photos?.filter(p => p.checkpoint === qa.question) || [];
        if (questionPhotos.length > 0) {
          contextText += `\nPHOTOS FOR THIS QUESTION:\n`;
          questionPhotos.forEach((photo, photoIndex) => {
            const globalIndex = photos?.indexOf(photo) || 0;
            contextText += `  Photo ${globalIndex + 1}:\n`;
            contextText += `    URL: ${photo.url}\n`;
            contextText += `    Caption: ${photo.caption || 'No caption'}\n`;
            contextText += `    HTML to insert:\n`;
            contextText += `    <div style="margin: 20px 0; page-break-inside: avoid;">\n`;
            contextText += `      <img src="${photo.url}" alt="${photo.caption || `Photo ${globalIndex + 1}`}" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px;" />\n`;
            contextText += `      <p style="margin-top: 8px; font-size: 14px; color: #64748b; font-style: italic;">Figure ${globalIndex + 1}${photo.caption ? `: ${photo.caption}` : ''}</p>\n`;
            contextText += `    </div>\n`;
          });
        }
        contextText += `\n`;
      });
    }

    if (estimationMethod && section === 'estimation') {
      contextText += `ESTIMATION METHOD:\n`;
      contextText += `Method: ${estimationMethod.method}\n`;
      if (estimationMethod.baseValue) {
        contextText += `Base Value: ${estimationMethod.baseValue} EUR\n`;
      }
      if (estimationMethod.depreciation) {
        contextText += `Depreciation: ${estimationMethod.depreciation}%\n`;
      }
      if (estimationMethod.repairCosts && estimationMethod.repairCosts.length > 0) {
        contextText += `\nREPAIR COSTS:\n`;
        estimationMethod.repairCosts.forEach((cost) => {
          contextText += `- ${cost.item}: ${cost.quantity} x ${cost.unitCost} EUR = ${cost.total} EUR\n`;
        });
        const total = estimationMethod.repairCosts.reduce((sum, cost) => sum + cost.total, 0);
        contextText += `TOTAL: ${total} EUR\n`;
      }
      contextText += `\n`;
    }

    contextText += `Write the ${section.toUpperCase()} section now. Use professional French maritime terminology. Be comprehensive and detailed.`;

    console.log('Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://maritime-expertise.com',
        'X-Title': 'Maritime Expertise Report Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: contextText,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const generatedText = result.choices[0].message.content;

    console.log('Section generated successfully');

    return new Response(
      JSON.stringify({
        section,
        content: generatedText,
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating section:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
