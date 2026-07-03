export interface DefectDetail {
  name: string;
  severity: "critical" | "major" | "minor";
  description: string;
}

export interface InspectionReport {
  status: "PASS" | "REJECT" | "REWORK";
  productType: string;
  defects: DefectDetail[];
  recommendations: string[];
  confidence: number;
  costImpact: string;
  batchRecommendation: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  "auto-components": "Auto Components",
  textiles: "Textiles",
  electronics: "Electronics",
  food: "Food Processing",
  pharmaceuticals: "Pharmaceuticals",
  metals: "Metals & Casting",
  plastics: "Plastics & Moulding",
  packaging: "Packaging",
};

const DEFECT_LABELS: Record<string, string> = {
  crack: "Crack",
  misalignment: "Misalignment",
  scratch: "Scratch",
  discoloration: "Discoloration",
  dent: "Dent",
  porosity: "Porosity",
  warping: "Warping",
  "surface-roughness": "Surface Roughness",
  "dimensional-error": "Dimensional Error",
  contamination: "Contamination",
};

function generateDemoReport(
  productType: string,
  defects: string[],
): InspectionReport {
  const productLabel = PRODUCT_LABELS[productType] || productType;
  const hasCritical = defects.some((d) =>
    ["crack", "porosity", "dimensional-error", "contamination"].includes(d),
  );
  const hasMajor = defects.some((d) =>
    ["misalignment", "discoloration", "dent", "warping"].includes(d),
  );

  const status = hasCritical ? "REJECT" : hasMajor ? "REWORK" : "PASS";

  return {
    status,
    productType: productLabel,
    defects: defects.map((d) => ({
      name: DEFECT_LABELS[d] || d,
      severity: (["crack", "porosity", "dimensional-error", "contamination"].includes(d)
        ? "critical"
        : ["misalignment", "discoloration", "dent", "warping"].includes(d)
          ? "major"
          : "minor") as "critical" | "major" | "minor",
      description: getDefectDescription(d, productLabel),
    })),
    recommendations: getRecommendations(defects, productLabel, status),
    confidence: 0.85 + Math.random() * 0.12,
    costImpact: hasCritical
      ? "High - Potential batch rejection"
      : hasMajor
        ? "Medium - Rework required"
        : "Low - Acceptable quality",
    batchRecommendation: hasCritical
      ? "Hold batch for manual inspection"
      : hasMajor
        ? "Allow with rework marking"
        : "Release batch",
  };
}

function getDefectDescription(defect: string, product: string): string {
  const descriptions: Record<string, string> = {
    crack: `Structural fracture detected in ${product} unit. May compromise structural integrity.`,
    misalignment: `Component alignment deviation exceeds tolerance for ${product}.`,
    scratch: `Surface scratch observed. Cosmetic defect on ${product} surface.`,
    discoloration: `Color variation detected. May indicate material or process inconsistency in ${product}.`,
    dent: `Physical indentation found on ${product} surface.`,
    porosity: `Internal voids/porosity detected. Critical structural concern for ${product}.`,
    warping: `Geometric deformation detected. ${product} deviates from spec dimensions.`,
    "surface-roughness": `Surface finish quality below acceptable threshold for ${product}.`,
    "dimensional-error": `Critical dimensional deviation detected. ${product} outside tolerance.`,
    contamination: `Foreign material or contaminant detected on ${product}.`,
  };
  return descriptions[defect] || `Defect observed in ${product}.`;
}

function getRecommendations(
  defects: string[],
  product: string,
  status: string,
): string[] {
  const recs: string[] = [];
  if (defects.includes("crack") || defects.includes("porosity")) {
    recs.push(`Inspect upstream tooling and moulds for ${product} production line`);
    recs.push("Perform ultrasonic or X-ray NDT on affected batch");
  }
  if (defects.includes("misalignment") || defects.includes("warping")) {
    recs.push("Recalibrate fixture jigs and check fixture wear");
    recs.push("Verify material thermal expansion coefficients");
  }
  if (defects.includes("scratch") || defects.includes("surface-roughness")) {
    recs.push("Review surface treatment process parameters");
    recs.push("Check conveyor/handling equipment for damage");
  }
  if (defects.includes("discoloration")) {
    recs.push("Audit raw material batches and supplier quality certs");
    recs.push("Verify oven/kiln temperature profiles");
  }
  if (defects.includes("contamination")) {
    recs.push("Immediate line hygiene audit required");
    recs.push("Review PPE compliance and cleaning SOPs");
  }
  if (defects.includes("dimensional-error")) {
    recs.push("Calibrate CNC/measurement instruments");
    recs.push("Review first-article inspection records");
  }
  if (defects.includes("dent")) {
    recs.push("Review handling and packing procedures");
    recs.push("Check storage and transit conditions");
  }
  if (status === "REJECT") {
    recs.push("Escalate to Quality Manager for disposition decision");
    recs.push("Document in non-conformance report (NCR) system");
  } else if (status === "REWORK") {
    recs.push("Route affected units to rework station");
    recs.push("Update rework tracking log");
  }
  recs.push("Log defect data in monthly quality dashboard for trend analysis");
  return recs;
}

const SYSTEM_PROMPT = `You are a factory quality inspection AI for Indian MSME manufacturing units. Analyze the product type and reported defects to produce a structured JSON inspection report. Consider common Indian manufacturing standards (BIS) and practical recommendations for small factory floors.

Respond ONLY with valid JSON in this exact format:
{
  "status": "PASS" | "REJECT" | "REWORK",
  "productType": "string",
  "defects": [{"name": "string", "severity": "critical"|"major"|"minor", "description": "string"}],
  "recommendations": ["string"],
  "confidence": 0.0-1.0,
  "costImpact": "string",
  "batchRecommendation": "string"
}`;

export async function analyzeQuality(
  productType: string,
  defects: string[],
): Promise<InspectionReport> {
  const productLabel = PRODUCT_LABELS[productType] || productType;
  const defectLabels = defects.map((d) => DEFECT_LABELS[d] || d).join(", ");

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return generateDemoReport(productType, defects);
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "MSME Factory Quality Agent",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-ultra-550b-a55b:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze quality for a factory producing ${productLabel}. The following defects were observed on the production line: ${defectLabels}. Provide a complete inspection report with severity assessment and actionable recommendations for an Indian MSME factory floor.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as InspectionReport;
      // Validate required fields
      if (parsed.status && parsed.defects && parsed.recommendations) {
        return parsed;
      }
    }
    // Fallback to demo report if parsing fails
    return generateDemoReport(productType, defects);
  } catch {
    // Fallback to demo report on any error
    return generateDemoReport(productType, defects);
  }
}
