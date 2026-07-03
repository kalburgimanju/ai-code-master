import { useState } from "react";
import {
  ArrowLeft,
  Droplets,
  Beaker,
  Bug,
  CalendarDays,
  Mountain,
  TrendingUp,
  Loader2,
  Sprout,
} from "lucide-react";
import { fetchFarmAdvice, type FarmAdvice } from "../lib/api";
import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Chhattisgarh",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const CROPS = [
  "Rice (Dhan)",
  "Wheat (Gehun)",
  "Cotton (Kapas)",
  "Sugarcanne (Ganna)",
  "Maize (Makka)",
  "Pulses (Dal)",
  "Groundnut (Moongphali)",
  "Soybean",
  "Potato (Aloo)",
  "Tomato (Tamatar)",
  "Onion (Pyaaz)",
  "Mustard (Sarson)",
];

const SOIL_TYPES = [
  "Alluvial Soil",
  "Black (Regur) Soil",
  "Red Soil",
  "Laterite Soil",
  "Desert Soil",
  "Mountain Soil",
  "Saline Soil",
  "Clayey Soil",
];

const ADVICE_ICONS: Record<keyof FarmAdvice, typeof Droplets> = {
  irrigation: Droplets,
  fertilizer: Beaker,
  pestControl: Bug,
  seasonalTips: CalendarDays,
  soilManagement: Mountain,
  estimatedYield: TrendingUp,
};

const ADVICE_LABELS: Record<keyof FarmAdvice, string> = {
  irrigation: "Irrigation Advice",
  fertilizer: "Fertilizer & Nutrients",
  pestControl: "Pest & Disease Control",
  seasonalTips: "Seasonal Tips",
  soilManagement: "Soil Management",
  estimatedYield: "Yield Estimate",
};

const ADVICE_COLORS: Record<keyof FarmAdvice, string> = {
  irrigation: "bg-sky/10 border-sky/20 text-sky",
  fertilizer: "bg-primary-50 border-primary-200 text-primary",
  pestControl: "bg-red-50 border-red-200 text-red-600",
  seasonalTips: "bg-wheat/10 border-wheat/20 text-wheat",
  soilManagement: "bg-earth/5 border-earth/20 text-earth",
  estimatedYield: "bg-purple-50 border-purple-200 text-purple-600",
};

export default function DemoPage({ onNavigate }: Props) {
  const [state, setState] = useState("");
  const [crop, setCrop] = useState("");
  const [soilType, setSoilType] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<FarmAdvice | null>(null);
  const [error, setError] = useState("");

  const canSubmit = state && crop && soilType && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setAdvice(null);

    try {
      const result = await fetchFarmAdvice({ state, crop, soilType });
      setAdvice(result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary" />
            <span className="font-bold text-primary-800">
              Farming Advice Demo
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tell Us About Your Farm
          </h2>
          <p className="text-gray-500 mb-8">
            Select your conditions and our AI will provide tailored advice for
            your specific situation.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="">Select crop...</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="">Select soil type...</option>
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-primary text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sprout className="w-5 h-5" />
                Get Farming Advice
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {advice && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Personalized Farming Advice
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {(Object.keys(advice) as Array<keyof FarmAdvice>).map((key) => {
                const Icon = ADVICE_ICONS[key];
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-6 transition-all hover:shadow-md ${ADVICE_COLORS[key]}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5" />
                      <h4 className="font-bold text-gray-900 text-sm">
                        {ADVICE_LABELS[key]}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {advice[key]}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 text-sm text-primary-800">
              <strong>Note:</strong> This advice is generated by AI based on
              general agricultural knowledge. Always consult your local Krishi
              Vigyan Kendra (KVK) or agricultural extension officer for
              field-specific recommendations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
