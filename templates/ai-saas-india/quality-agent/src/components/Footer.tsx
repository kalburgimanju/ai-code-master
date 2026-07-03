import { Factory } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-industrial text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Factory size={18} />
              </div>
              <span className="font-bold text-white">QualityAgent</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered quality inspection for Indian MSME manufacturing.
              Built on the factory floor, for the factory floor.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Industries</h4>
            <ul className="space-y-2 text-sm">
              <li>Auto Components</li>
              <li>Textiles</li>
              <li>Electronics</li>
              <li>Food Processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>hello@qualityagent.in</li>
              <li>+91 98765 43210</li>
              <li>Pune, Maharashtra, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm">
            &copy; 2024 QualityAgent. Made for Indian MSME factories.
          </p>
          <p className="text-sm text-gray-500">
            Built with ❤️ for the Make in India initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
