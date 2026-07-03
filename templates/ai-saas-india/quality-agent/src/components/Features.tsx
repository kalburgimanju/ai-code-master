import { Eye, MessageCircle, Cpu, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Defect Detection",
    description:
      "Real-time visual inspection using edge AI models. Detect cracks, scratches, misalignment, discoloration, and more with >98% accuracy on your production line.",
    color: "bg-orange-100 text-primary",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Alerts",
    description:
      "Instant defect notifications via WhatsApp to QC managers and line supervisors. Includes defect images, severity level, and batch info — no app installation needed.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: Cpu,
    title: "Edge Deployment",
    description:
      "Runs on affordable edge devices — Raspberry Pi, mobile phones, or existing CCTV infrastructure. No cloud dependency. Works offline after initial setup.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: BarChart3,
    title: "Batch Analytics",
    description:
      "Track defect trends, shift-wise quality, and supplier impact. Auto-generate BIS-compliant quality reports. Export data for audits and continuous improvement.",
    color: "bg-purple-100 text-purple-700",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial mb-4">
            Built for the Factory Floor
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything your MSME factory needs for AI-powered quality control —
            from defect detection to actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface rounded-2xl p-6 border border-orange-100 hover:shadow-md transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
              >
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-industrial mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
