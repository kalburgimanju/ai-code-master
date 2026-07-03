import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Globe,
  Loader2,
  Mic,
  Package,
  Search,
  Send,
  ShoppingCart,
  Star,
} from "lucide-react";
import { LANGUAGES, SAMPLE_VOICE_QUERIES } from "../data";
import { searchProducts } from "../api";
import type { Product, SearchResult } from "../types";

interface DemoPageProps {
  onBack: () => void;
}

export function DemoPage({ onBack }: DemoPageProps) {
  const [selectedLang, setSelectedLang] = useState("hi");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang);
  const sampleQueries = SAMPLE_VOICE_QUERIES[selectedLang] ?? SAMPLE_VOICE_QUERIES.en ?? [];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchProducts(query.trim(), selectedLang);
      setResult(res);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Voice Demo</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe className="w-4 h-4" />
              <span>{currentLang?.nativeName}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero for Demo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            <span className="gradient-text">Voice Commerce</span> Demo
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Select your language, type or paste a product query, and see how
            VoiceCommerce understands vernacular shopping intent.
          </p>
        </div>

        {/* Language Selector + Search Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8">
          {/* Language Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Your Language / अपनी भाषा चुनें
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setQuery("");
                    setResult(null);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedLang === lang.code
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-70">{lang.flag}</div>
                    <div className="font-semibold">{lang.nativeName}</div>
                    <div className="text-[10px] opacity-60">{lang.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sample Queries */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Try a sample query / कोई नमूना प्रश्न आज़माएँ
            </label>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sq) => (
                <button
                  key={sq}
                  onClick={() => setQuery(sq)}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors border border-primary-100"
                >
                  "{sq}"
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedLang === "en"
                      ? "e.g., I need cooking oil and spices..."
                      : "e.g., मुझे तेल और मसाले चाहिए..."
                  }
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-6 py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Search Products</span>
              </button>
            </div>
          </div>

          {/* Demo Mode Notice */}
          {!import.meta.env.VITE_OPENROUTER_API_KEY && (
            <div className="mt-4 px-4 py-2.5 bg-warm-100 border border-warm-200 rounded-xl text-sm text-warm-500 flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>
                <strong>Demo Mode:</strong> Showing curated ONDC products. Set{" "}
                <code className="px-1.5 py-0.5 bg-warm-200/50 rounded text-xs font-mono">
                  VITE_OPENROUTER_API_KEY
                </code>{" "}
                in .env for AI-powered search.
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Intent Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Understood Intent
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {result.intent}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Language: {currentLang?.nativeName} ({result.language}) •{" "}
                    {result.products.length} products found
                  </p>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Search
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a language and enter a product query above. The AI will
              understand your intent and show relevant ONDC products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      {/* Product Image Placeholder */}
      <div
        className={`h-36 ${product.imageGradient} flex items-center justify-center relative`}
      >
        <Package className="w-12 h-12 text-white/60 group-hover:scale-110 transition-transform" />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-primary-700">
          {product.category}
        </span>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-extrabold text-primary-700">
              ₹{product.price}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 text-warm-400 fill-warm-400" />
            <span className="font-semibold">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium text-primary-600">{product.seller}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {product.deliveryDays}d delivery
          </span>
        </div>
      </div>
    </div>
  );
}
