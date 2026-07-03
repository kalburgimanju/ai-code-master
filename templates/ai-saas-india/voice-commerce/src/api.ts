import type { Product, SearchResult } from "./types";
import { MOCK_PRODUCTS } from "./data";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

const SYSTEM_PROMPT = `You are a product search assistant for ONDC (Open Network for Digital Commerce) in India.
When given a search query in any Indian language, you must:
1. Understand the product intent from the vernacular text
2. Return a JSON response with the following structure:
{
  "query": "original query",
  "language": "detected language code",
  "intent": "brief description of what the user wants",
  "products": [
    {
      "id": "ondc-XXX",
      "name": "Product Name",
      "price": number in INR,
      "currency": "INR",
      "description": "Short product description",
      "category": "category name",
      "seller": "seller name (Indian e-commerce sellers)",
      "rating": number between 1-5,
      "deliveryDays": number
    }
  ]
}
Return 6 realistic Indian products with actual market prices. Only return valid JSON, no markdown.`;

function buildMockResults(query: string, langCode: string): SearchResult {
  const queryLower = query.toLowerCase();
  let filtered = MOCK_PRODUCTS;

  if (
    queryLower.includes("तेल") ||
    queryLower.includes("oil") ||
    queryLower.includes("ಸೋಜಿ") ||
    queryLower.includes("எண்ணெய்")
  ) {
    filtered = MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes("oil") ||
        p.category === "Groceries",
    );
  } else if (
    queryLower.includes("दूध") ||
    queryLower.includes("milk") ||
    queryLower.includes("ಹಾಲು") ||
    queryLower.includes("பால்")
  ) {
    filtered = MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes("milk") || p.category === "Dairy",
    );
  } else if (
    queryLower.includes("स्नैक") ||
    queryLower.includes("snack") ||
    queryLower.includes("bhujia") ||
    queryLower.includes("namkeen")
  ) {
    filtered = MOCK_PRODUCTS.filter((p) => p.category === "Snacks");
  }

  if (filtered.length === 0) filtered = MOCK_PRODUCTS.slice(0, 4);

  return {
    query,
    language: langCode,
    intent: `Search for: ${query}`,
    products: filtered,
  };
}

export async function searchProducts(
  query: string,
  langCode: string,
): Promise<SearchResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "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";

  if (!apiKey) {
    // Demo mode: return mock results
    await new Promise((r) => setTimeout(r, 800));
    return buildMockResults(query, langCode);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Vernacular Voice Commerce ONDC",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Search query in language code "${langCode}": "${query}". Return ONLY valid JSON, no markdown fences.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.warn("OpenRouter API error, falling back to demo mode");
      return buildMockResults(query, langCode);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildMockResults(query, langCode);
    }

    const parsed = JSON.parse(jsonMatch[0]) as SearchResult;

    // Ensure we have products with required fields
    if (!parsed.products || parsed.products.length === 0) {
      return buildMockResults(query, langCode);
    }

    // Add gradient classes to each product
    const gradients = [
      "card-gradient-1",
      "card-gradient-2",
      "card-gradient-3",
      "card-gradient-4",
      "card-gradient-5",
      "card-gradient-6",
    ];
    parsed.products = parsed.products.map((p: Product, i: number) => ({
      ...p,
      imageGradient: gradients[i % gradients.length],
      currency: "INR",
    }));

    return parsed;
  } catch (err) {
    console.warn("Failed to call OpenRouter, using demo mode:", err);
    return buildMockResults(query, langCode);
  }
}
