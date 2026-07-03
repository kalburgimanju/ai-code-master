import { useState } from "react";
import type { Page } from "../App";
import Navbar from "../components/Navbar";
import { analyzeQuality, type InspectionReport } from "../lib/api";

const PRODUCT_TYPES = [
  { id: "auto-components", label: "Auto Components", icon: "⚙️" },
  { id: "textiles", label: "Textiles", icon: "🧵" },
  { id: "electronics", label: "Electronics", icon: "🔌" },
  { id: "food", label: "Food Processing", icon: "🍎" },
  { id: "pharmaceuticals", label: "Pharmaceuticals", icon: "💊" },
  { id: "metals", label: "Metals & Casting", icon: "🔩" },
  { id: "plastics", label: "Plastics & Moulding", icon: "🧪" },
  { id: "packaging", label: "Packaging", icon: "📦" },
];

const DEFECT_TYPES = [
  { id: "crack", label: "Crack", severity: "critical" },
  { id: "misalignment", label: "Misalignment", severity: "major" },
  { id: "scratch", label: "Scratch", severity: "minor" },
  { id: "discoloration", label: "Discoloration", severity: "major" },
  { id: "dent", label: "Dent", severity: "major" },
  { id: "porosity", label: "Porosity", severity: "critical" },
  { id: "warping", label: "Warping", severity: "major" },
  { id: "surface-roughness", label: "Surface Roughness", severity: "minor" },
  { id: "dimensional-error", label: "Dimensional Error", severity: "critical" },
  { id: "contamination", label: "Contamination", severity: "critical" },
];

interface Props {
  onNavigate: (page: Page) => void;
}

export default function DemoPage({ onNavigate }: Props) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<InspectionReport | null>(null);

  const toggleDefect = (id: string) => {
    setSelectedDefects((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleAnalyze = async () => {
    if (!selectedProduct || selectedDefects.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeQuality(selectedProduct, selectedDefects);
      setReport(result);
    } catch {
      setReport(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onNavigate={onNavigate} />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-industrial mb-3">
            Quality Inspection Demo
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select a product type and observed defects to run an AI-powered
            quality analysis. This demo uses OpenRouter's free model.
          </p>
        </div>

        {/* Product Type Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-industrial mb-4">
            1. Select Product Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRODUCT_TYPES.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedProduct === product.id
                    ? "border-primary bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                <span className="text-2xl">{product.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {product.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Defect Type Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-industrial mb-4">
            2. Select Observed Defects
          </h2>
          <div className="flex flex-wrap gap-2">
            {DEFECT_TYPES.map((defect) => {
              const isSelected = selectedDefects.includes(defect.id);
              const severityColor =
                defect.severity === "critical"
                  ? "bg-red-100 text-red-700 border-red-300"
                  : defect.severity === "major"
                    ? "bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-blue-100 text-blue-700 border-blue-300";
              return (
                <button
                  key={defect.id}
                  onClick={() => toggleDefect(defect.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                    isSelected
                      ? `${severityColor} shadow-sm`
                      : "border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  {defect.label}
                  <span className="ml-1 text-xs opacity-70">
                    ({defect.severity})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleAnalyze}
            disabled={!selectedProduct || selectedDefects.length === 0 || isAnalyzing}
            className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "🔍 Analyze Quality"
            )}
          </button>
        </div>

        {/* Report */}
        {report && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-industrial mb-4">
              Inspection Report
            </h2>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${
                report.status === "PASS"
                  ? "bg-green-100 text-green-700"
                  : report.status === "REWORK"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {report.status}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Product Type
                </h3>
                <p className="text-gray-600">{report.productType}</p>

                <h3 className="font-semibold text-gray-700 mb-2 mt-4">
                  Defect Details
                </h3>
                <ul className="space-y-2">
                  {report.defects.map((d, i) => (
                    <li
                      key={i}
                      className="bg-gray-50 rounded-lg p-3 text-sm"
                    >
                      <span className="font-medium">{d.name}</span>
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          d.severity === "critical"
                            ? "bg-red-100 text-red-600"
                            : d.severity === "major"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {d.severity}
                      </span>
                      {d.description && (
                        <p className="text-gray-500 mt-1">{d.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 text-sm text-gray-700"
                    >
                      <span className="text-primary mt-0.5">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Confidence:</span>{" "}
                    {(report.confidence * 100).toFixed(0)}%
                  </p>
                  <p>
                    <span className="font-medium">Estimated Cost Impact:</span>{" "}
                    {report.costImpact}
                  </p>
                  <p>
                    <span className="font-medium">Batch Recommendation:</span>{" "}
                    {report.batchRecommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
