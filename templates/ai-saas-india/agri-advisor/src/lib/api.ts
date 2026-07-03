const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export interface FarmQuery {
  state: string;
  crop: string;
  soilType: string;
}

export interface FarmAdvice {
  irrigation: string;
  fertilizer: string;
  pestControl: string;
  seasonalTips: string;
  soilManagement: string;
  estimatedYield: string;
}

function buildPrompt(q: FarmQuery): string {
  return `You are an expert Indian agronomist. Provide practical, actionable farming advice for the following conditions:

State: ${q.state}
Crop: ${q.crop}
Soil Type: ${q.soilType}

Respond in valid JSON only, with these exact keys:
{
  "irrigation": " irrigation advice",
  "fertilizer": "fertilizer and nutrient management advice",
  "pestControl": "pest and disease control advice",
  "seasonalTips": "seasonal and timing tips",
  "soilManagement": "soil management and amendment advice",
  "estimatedYield": "expected yield estimate and factors"
}

Be specific to Indian farming conditions, use locally available inputs, and mention specific product names and application rates where appropriate. Keep each field concise (2-4 sentences).`;
}

function parseFallback(): FarmAdvice {
  return {
    irrigation:
      "Use drip irrigation for water efficiency. Water early morning or late evening. Maintain 60-70% field capacity during vegetative stage.",
    fertilizer:
      "Apply balanced NPK (10:26:26) at sowing. Top-dress with urea at 30 and 60 days. Use organic manure at 5-10 tonnes per hectare.",
    pestControl:
      "Monitor for common pests weekly. Use neem oil spray (5ml/L) as organic solution. Apply recommended pesticides only when pest threshold is reached.",
    seasonalTips:
      "Sow during the recommended window for your region. Monitor weather forecasts for early warnings on unseasonal rain or heat waves.",
    soilManagement:
      "Test soil annually and adjust pH to 6.5-7.5. Practice crop rotation. Add compost and green manure to improve organic carbon content.",
    estimatedYield:
      "With good management practices, expect yields of 3-4 tonnes per hectare for most cereal crops. Variety selection and timely operations are key.",
  };
}

export async function fetchFarmAdvice(query: FarmQuery): Promise<FarmAdvice> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

  if (!apiKey) {
    return getDemoAdvice(query);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Agronomist India",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert Indian agricultural advisor. Respond only in valid JSON.",
          },
          { role: "user", content: buildPrompt(query) },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status);
      return getDemoAdvice(query);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as FarmAdvice;
    }
    return getDemoAdvice(query);
  } catch (err) {
    console.error("Failed to fetch advice:", err);
    return getDemoAdvice(query);
  }
}

function getDemoAdvice(query: FarmQuery): FarmAdvice {
  const fallback = parseFallback();

  return {
    ...fallback,
    irrigation: `[${query.state} / ${query.crop}] ${fallback.irrigation}`,
    fertilizer: `[${query.soilType} soil] ${fallback.fertilizer}`,
  };
}
