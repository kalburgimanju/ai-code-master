import { ArrowRight, Eye } from "lucide-react";
import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

export default function Hero({ onNavigate }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-orange-600 to-amber-600 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Eye size={16} />
              Vision-Based AI for MSME Factories
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Catch Every Defect
              <span className="block text-amber-200">Before It Ships</span>
            </h1>
            <p className="text-lg md:text-xl text-orange-100 mb-8 max-w-lg">
              Deploy AI-powered quality inspection on your production line.
              Works with mobile phones, CCTV cameras, and edge devices.
              Built for Indian MSME manufacturing.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("demo")}
                className="bg-white text-primary font-bold py-3 px-8 rounded-xl text-lg hover:bg-amber-50 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Try Free Demo <ArrowRight size={18} />
              </button>
              <a
                href="#features"
                className="border-2 border-white/40 text-white font-semibold py-3 px-8 rounded-xl text-lg hover:bg-white/10 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="bg-industrial/80 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-auto text-xs text-gray-400">
                    live-inspection
                  </span>
                </div>
                <div className="font-mono text-sm space-y-1.5 text-green-300">
                  <p>
                    <span className="text-gray-400">$</span> quality-agent
                    scan --camera=cam-01
                  </p>
                  <p className="text-amber-300">
                    ⚠ Detected: Surface scratch (confidence: 94.2%)
                  </p>
                  <p className="text-red-300">
                    ✗ Defect: Crack on bolt housing (severity: CRITICAL)
                  </p>
                  <p className="text-green-300">
                    ✓ WhatsApp alert sent to QC Manager
                  </p>
                  <p className="text-blue-300">
                    📊 Logged to batch report #2024-06-0847
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-2xl font-bold">2.3ms</div>
                  <div className="text-orange-200 text-xs">Latency</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-2xl font-bold">99.1%</div>
                  <div className="text-orange-200 text-xs">Accuracy</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-orange-200 text-xs">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
