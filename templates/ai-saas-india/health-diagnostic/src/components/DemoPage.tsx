import { useState } from "react";
import {
  Camera,
  Mic,
  Send,
  AlertTriangle,
  CheckCircle2,
  Info,
  MapPin,
  Pill,
  FileText,
  ArrowLeft,
  Loader2,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";

type Severity = "low" | "moderate" | "high" | "critical";

interface DiagnosisResult {
  condition: string;
  severity: Severity;
  confidence: number;
  description: string;
  recommendations: string[];
  warningSigns: string[];
  nearbyFacilities: { name: string; distance: string; type: string }[];
  followUp: string;
}

const SYMPTOMS = [
  {
    id: "skin-rash",
    label: "Skin Rash",
    icon: Camera,
    description: "Redness, bumps, or irritation on skin",
    category: "visual" as const,
  },
  {
    id: "eye-redness",
    label: "Eye Redness",
    icon: Camera,
    description: "Red, irritated, or swollen eyes",
    category: "visual" as const,
  },
  {
    id: "cough",
    label: "Cough",
    icon: Mic,
    description: "Persistent or dry/wet cough",
    category: "audio" as const,
  },
  {
    id: "fever",
    label: "Fever",
    icon: AlertTriangle,
    description: "Elevated body temperature",
    category: "symptom" as const,
  },
  {
    id: "headache",
    label: "Headache",
    icon: AlertTriangle,
    description: "Persistent or severe headache",
    category: "symptom" as const,
  },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  { code: "or", label: "Odia" },
  { code: "as", label: "Assamese" },
];

const DEMO_RESULTS: Record<string, DiagnosisResult> = {
  "skin-rash": {
    condition: "Contact Dermatitis / Allergic Reaction",
    severity: "moderate",
    confidence: 78,
    description:
      "Based on the reported symptoms, this appears consistent with contact dermatitis or an allergic skin reaction. Common triggers include new soaps, detergents, plants, or fabrics. The rash may present as red, itchy patches with possible small blisters.",
    recommendations: [
      "Apply cool compresses to affected area 3-4 times daily",
      "Use over-the-counter hydrocortisone cream (1%) for itch relief",
      "Avoid scratching to prevent secondary infection",
      "Switch to hypoallergenic soap and detergent",
      "Wear loose, cotton clothing over affected area",
    ],
    warningSigns: [
      "Fever above 101°F (38.3°C)",
      "Rapidly spreading rash",
      "Pus or yellow crusting",
      "Swelling of face, lips, or throat",
    ],
    nearbyFacilities: [
      { name: "Primary Health Centre (PHC)", distance: "2.5 km", type: "Government" },
      { name: "Community Health Centre", distance: "8 km", type: "Government" },
      { name: "Dr. Sharma Clinic", distance: "3.1 km", type: "Private" },
    ],
    followUp:
      "If symptoms do not improve within 5-7 days, or if the rash spreads or shows signs of infection, please visit a healthcare facility immediately.",
  },
  "eye-redness": {
    condition: "Conjunctivitis (Pink Eye)",
    severity: "moderate",
    confidence: 82,
    description:
      "The symptoms suggest possible conjunctivitis, an inflammation of the conjunctiva. This can be caused by viral or bacterial infection, or allergic reaction. Common symptoms include redness, itching, watering, and discharge.",
    recommendations: [
      "Wash hands frequently to prevent spreading",
      "Avoid touching or rubbing the affected eye",
      "Use clean, warm compresses to soothe irritation",
      "Do not share towels, pillows, or eye makeup",
      "Use preservative-free artificial tears for comfort",
    ],
    warningSigns: [
      "Severe eye pain or pressure",
      "Vision changes or blurriness",
      "Sensitivity to light",
      "Thick yellow/green discharge",
    ],
    nearbyFacilities: [
      { name: "Primary Health Centre (PHC)", distance: "2.5 km", type: "Government" },
      { name: "District Hospital Eye Clinic", distance: "12 km", type: "Government" },
      { name: "Vision Care Clinic", distance: "4.2 km", type: "Private" },
    ],
    followUp:
      "If symptoms worsen or do not improve within 3 days, please see an ophthalmologist. Bacterial conjunctivitis may require antibiotic drops.",
  },
  cough: {
    condition: "Upper Respiratory Infection",
    severity: "low",
    confidence: 75,
    description:
      "The cough pattern is consistent with an upper respiratory tract infection (common cold). This is usually viral in nature and typically resolves within 7-10 days. The cough may be dry initially and become productive as the infection progresses.",
    recommendations: [
      "Stay well hydrated - drink warm fluids and water",
      "Rest adequately and avoid strenuous activity",
      "Use honey in warm water for cough relief (adults only)",
      "Keep室内空气 humidified if possible",
      "Avoid cold drinks and dusty environments",
    ],
    warningSigns: [
      "Cough lasting more than 3 weeks",
      "Blood in sputum",
      "High fever (above 102°F / 38.9°C)",
      "Difficulty breathing or chest pain",
    ],
    nearbyFacilities: [
      { name: "Primary Health Centre (PHC)", distance: "2.5 km", type: "Government" },
      { name: "Sub-Centre", distance: "1.2 km", type: "Government" },
      { name: "Dr. Patel General Clinic", distance: "3.8 km", type: "Private" },
    ],
    followUp:
      "Most upper respiratory infections resolve on their own. If cough persists beyond 2 weeks, develops into a productive cough with colored sputum, or is accompanied by breathing difficulty, seek medical attention.",
  },
  fever: {
    condition: "Viral Fever / Influenza-like Illness",
    severity: "moderate",
    confidence: 70,
    description:
      "Fever is a common symptom that can indicate various conditions. Based on the reported symptoms, this appears to be a viral fever or influenza-like illness. This is typically self-limiting but requires monitoring for complications.",
    recommendations: [
      "Take paracetamol (500mg) every 6-8 hours as needed for fever",
      "Drink at least 2-3 liters of water daily",
      "Rest completely for 3-5 days",
      "Use lukewarm sponging if fever is high",
      "Monitor temperature every 4 hours",
    ],
    warningSigns: [
      "Fever lasting more than 3 days",
      "Severe headache with stiff neck",
      "Rash appearing with fever",
      "Bleeding from any site",
    ],
    nearbyFacilities: [
      { name: "Primary Health Centre (PHC)", distance: "2.5 km", type: "Government" },
      { name: "Community Health Centre", distance: "8 km", type: "Government" },
      { name: "District Hospital", distance: "15 km", type: "Government" },
    ],
    followUp:
      "If fever persists beyond 3 days, or if you develop severe symptoms like persistent vomiting, rash, or confusion, seek immediate medical care. In areas with mosquito-borne diseases, get tested for dengue and malaria.",
  },
  headache: {
    condition: "Tension-type Headache",
    severity: "low",
    confidence: 72,
    description:
      "The reported symptoms are consistent with tension-type headaches, the most common type of headache. These are typically caused by stress, poor posture, lack of sleep, or dehydration. The pain is usually mild to moderate and bilateral.",
    recommendations: [
      "Take paracetamol (500mg) for pain relief",
      "Apply a cold or warm compress to forehead or neck",
      "Rest in a quiet, dark room",
      "Stay hydrated - drink at least 8 glasses of water",
      "Practice gentle neck stretches and deep breathing",
    ],
    warningSigns: [
      "Sudden, severe headache (thunderclap)",
      "Headache with fever and stiff neck",
      "Vision changes or loss of consciousness",
      "Headache after head injury",
    ],
    nearbyFacilities: [
      { name: "Primary Health Centre (PHC)", distance: "2.5 km", type: "Government" },
      { name: "Sub-Centre", distance: "1.2 km", type: "Government" },
      { name: "NeuroCare Clinic", distance: "6.5 km", type: "Private" },
    ],
    followUp:
      "If headaches are recurring (more than 2 per week), severe, or associated with neurological symptoms, please consult a healthcare provider for proper evaluation.",
  },
};

function getSeverityColor(severity: Severity) {
  switch (severity) {
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    case "moderate":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
  }
}

function getSeverityIcon(severity: Severity) {
  switch (severity) {
    case "low":
      return <ShieldCheck className="w-5 h-5 text-green-600" />;
    case "moderate":
      return <Shield className="w-5 h-5 text-amber-600" />;
    case "high":
      return <ShieldAlert className="w-5 h-5 text-orange-600" />;
    case "critical":
      return <ShieldAlert className="w-5 h-5 text-red-600" />;
  }
}

export default function DemoPage() {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const buildPrompt = (symptomId: string, notes: string, lang: string) => {
    const symptom = SYMPTOMS.find((s) => s.id === symptomId);
    const langName = LANGUAGES.find((l) => l.code === lang)?.label || "English";

    return `You are a rural health diagnostic AI assistant for healthcare in India. A patient reports the following symptom: ${symptom?.label} - ${symptom?.description}. ${notes ? `Additional notes: ${notes}.` : ""}

Please provide a structured health screening report in ${langName} with the following JSON format (no markdown, just raw JSON):
{
  "condition": "Most likely condition based on symptoms",
  "severity": "low" or "moderate" or "high" or "critical",
  "confidence": (number between 60-95),
  "description": "Detailed explanation of the likely condition in 2-3 sentences",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "warningSigns": ["warning sign 1", "warning sign 2", "warning sign 3"],
  "nearbyFacilities": [{"name": "Type of facility (e.g., PHC/CHC/District Hospital)", "distance": "estimated distance", "type": "Government/Private"}],
  "followUp": "Follow-up instructions in 2-3 sentences"
}

IMPORTANT DISCLAIMER: This is a preliminary screening only and not a medical diagnosis. Always consult a qualified healthcare professional. The AI recommendation should not replace professional medical advice.`;
  };

  const handleAnalyze = async () => {
    if (!selectedSymptom) return;

    setIsLoading(true);
    setApiError(null);
    setResult(null);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Rural Health Diagnostic Agent",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-ultra-550b-a55b:free",
          messages: [
            {
              role: "system",
              content:
                "You are a medical AI assistant specialized in rural healthcare screening for India. Always respond with valid JSON only. Include a disclaimer that this is not a medical diagnosis.",
            },
            {
              role: "user",
              content: buildPrompt(selectedSymptom, additionalNotes, selectedLanguage),
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No response content from API");
      }

      // Try to parse JSON from the response, handling possible markdown wrapping
      let parsed: DiagnosisResult;
      try {
        // Remove markdown code blocks if present
        const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(jsonStr) as DiagnosisResult;
      } catch {
        // If JSON parsing fails, try to extract JSON object from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]) as DiagnosisResult;
        } else {
          throw new Error("Could not parse API response as JSON");
        }
      }

      setResult(parsed);
    } catch (err) {
      console.error("API Error:", err);
      setApiError(
        err instanceof Error ? err.message : "Failed to get diagnosis. Using demo data."
      );
      // Fall back to demo data
      setResult(DEMO_RESULTS[selectedSymptom] ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Health Screening Demo</h1>
              <p className="text-teal-100 text-sm">
                AI-powered preliminary health assessment
              </p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-sm flex items-start gap-2 mt-4">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-teal-200" />
            <p className="text-teal-50">
              <strong>Disclaimer:</strong> This is an AI screening tool for informational
              purposes only. It is not a substitute for professional medical advice,
              diagnosis, or treatment. Always consult a qualified healthcare provider.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!result ? (
          <div className="max-w-3xl mx-auto">
            {/* Symptom Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Select Your Symptom
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose the primary symptom you are experiencing
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptom === symptom.id;
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => setSelectedSymptom(symptom.id)}
                      className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
                          : "border-gray-100 hover:border-teal-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <symptom.icon
                          className={`w-5 h-5 ${isSelected ? "text-teal-600" : "text-gray-400"}`}
                        />
                        <span
                          className={`font-medium text-sm ${isSelected ? "text-teal-700" : "text-gray-900"}`}
                        >
                          {symptom.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">{symptom.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Report Language
                </h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                      selectedLanguage === lang.code
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Additional Notes
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Optional: describe duration, severity, or other symptoms
              </p>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g., The rash started 3 days ago, itchy, on both arms..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                rows={3}
              />
            </div>

            {/* Analyze Button */}
            {apiError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Using demo data
                  </p>
                  <p className="text-xs text-amber-600 mt-1">{apiError}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!selectedSymptom || isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
                selectedSymptom && !isLoading
                  ? "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Analyze Symptoms
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Powered by AI. Results are preliminary screening only — not a medical
              diagnosis.
            </p>
          </div>
        ) : (
          /* Results */
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setResult(null);
                setApiError(null);
              }}
              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Screening
            </button>

            {/* Diagnosis Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {result.condition}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Preliminary AI Health Screening Report
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getSeverityColor(result.severity)}`}>
                  {getSeverityIcon(result.severity)}
                  {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} Severity
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">AI Confidence</span>
                  <span className="font-semibold text-gray-900">{result.confidence}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Assessment
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.description}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Recommendations */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning Signs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Warning Signs — Seek Immediate Care
                </h3>
                <ul className="space-y-3">
                  {result.warningSigns.map((sign, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nearby Facilities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Nearby Health Facilities
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {result.nearbyFacilities.map((facility, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <p className="font-medium text-sm text-gray-900 mb-1">
                      {facility.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {facility.distance}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          facility.type === "Government"
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {facility.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up */}
            <div className="bg-teal-50 rounded-2xl border border-teal-200 p-6 md:p-8 mb-6">
              <h3 className="text-base font-semibold text-teal-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" />
                Follow-up Instructions
              </h3>
              <p className="text-sm text-teal-800 leading-relaxed">
                {result.followUp}
              </p>
            </div>

            {/* Final Disclaimer */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> This AI screening is for informational purposes
                only. It does not constitute medical advice, diagnosis, or treatment.
                Always seek the advice of a qualified healthcare provider with any
                questions regarding a medical condition.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
