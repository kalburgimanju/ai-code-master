import type { InvoiceData, LineItem } from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

function getApiKey(): string | null {
  try {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (typeof key === "string" && key.length > 0) return key;
  } catch {
    // Vite env not available
  }
  return null;
}

const EXTRACTION_PROMPT = `You are an Indian GST invoice parser. Extract structured data from the invoice text provided.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "invoiceNumber": "string",
  "invoiceDate": "DD/MM/YYYY",
  "supplierName": "string",
  "supplierGstin": "string (2-digit state code + 10 char PAN + 1 char + PAN)",
  "supplierState": "string (2-digit state code)",
  "buyerName": "string",
  "buyerGstin": "string or empty",
  "buyerState": "string (2-digit state code)",
  "placeOfSupply": "string (2-digit state code)",
  "lineItems": [
    {
      "description": "string (item name)",
      "hsnCode": "string (HSN code, 4-8 digits)",
      "hsnDescription": "string (item category)",
      "quantity": number,
      "unit": "NOS/KGS/MTR/etc",
      "unitPrice": number,
      "taxableAmount": number,
      "cgstRate": number,
      "cgstAmount": number,
      "sgstRate": number,
      "sgstAmount": number,
      "igstRate": number,
      "igstAmount": number,
      "totalAmount": number
    }
  ],
  "totalTaxableAmount": number,
  "totalCgst": number,
  "totalSgst": number,
  "totalIgst": number,
  "grandTotal": number
}

Rules:
- If IGST applies (inter-state), set CGST and SGST to 0. If CGST+SGST apply (intra-state), set IGST to 0.
- Standard GST rates are 0%, 5%, 12%, 18%, 28%.
- If a field is not found, use reasonable defaults (0 for numbers, "" for strings).
- HSN codes must be valid Indian HSN codes (4-8 digit numeric).
- All monetary values in INR.`;

const HSN_MAPPING_PROMPT = `You are an Indian HSN code mapping expert. For each line item, provide a valid Indian HSN code mapping.

Return ONLY a valid JSON array (no markdown, no code fences):
[
  {
    "hsnCode": "4-digit or 6-digit HSN code",
    "description": "item description",
    "uqc": "unit of quantity code (NOS, KGS, MTR, BOX, PCS, BAG, etc)",
    "taxableValue": number,
    "totalTax": number
  }
]

Rules:
- Use official Indian HSN codes from GST tariff.
- Common HSN mappings:
  - Software/IT: 8471, 8523, 998314
  - Office supplies: 4820, 8443
  - Electronics: 8517, 8528, 8471
  - Textiles: 5208, 5407, 6204
  - Food: 0713, 1006, 1101
  - Chemicals: 3004, 3204
  - Stationery: 4820, 4819
  - Furniture: 9403
  - Services: 9954, 9961, 9971
  - Metals: 7204, 7326, 7616
  - Building materials: 6802, 6901, 7307
- UQC (Unit Quantity Code) is required for GST returns.`;

function parseJsonResponse<T>(text: string): T {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Find the first { or [ to start of JSON
  const jsonStart = cleaned.search(/[\[{]/);
  if (jsonStart === -1) throw new Error("No JSON found in response");
  cleaned = cleaned.slice(jsonStart);

  // Try to find the last } or ]
  const jsonEnd = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (jsonEnd !== -1) cleaned = cleaned.slice(0, jsonEnd + 1);

  return JSON.parse(cleaned) as T;
}

async function callOpenRouter(prompt: string, content: string): Promise<string> {
  const apiKey = getApiKey();
  const isDemoMode = !apiKey;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey
        ? { Authorization: `Bearer ${apiKey}` }
        : { "HTTP-Referer": "https://gst-automation-agent.netlify.app" }),
    },
    body: JSON.stringify({
      model: isDemoMode ? "meta-llama/llama-3.1-8b-instruct:free" : MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export function isDemoMode(): boolean {
  return !getApiKey();
}

export async function extractInvoiceData(invoiceText: string): Promise<InvoiceData> {
  const response = await callOpenRouter(EXTRACTION_PROMPT, invoiceText);
  return parseJsonResponse<InvoiceData>(response);
}

export async function mapHsnCodes(lineItems: LineItem[]): Promise<
  Array<{ hsnCode: string; description: string; uqc: string; taxableValue: number; totalTax: number }>
> {
  const response = await callOpenRouter(HSN_MAPPING_PROMPT, JSON.stringify(lineItems, null, 2));
  return parseJsonResponse(response);
}
