import { Camera, ScanLine, Bell, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: 1,
    title: "Connect Camera",
    description:
      "Point your mobile phone, CCTV, or USB camera at the production line. No special hardware required.",
  },
  {
    icon: ScanLine,
    step: 2,
    title: "AI Scans in Real-Time",
    description:
      "Edge AI model analyzes each product frame-by-frame, identifying defects against your quality specifications.",
  },
  {
    icon: Bell,
    step: 3,
    title: "Instant Alerts",
    description:
      "Defects trigger WhatsApp alerts with images to the right people. Reject, rework, or pass decisions in seconds.",
  },
  {
    icon: BarChart3,
    step: 4,
    title: "Continuous Improvement",
    description:
      "Analytics dashboard tracks trends by shift, line, supplier. Data-driven quality improvement for your factory.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-surface-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Four simple steps to transform your quality control process.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.step} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-orange-300" />
              )}
              <div className="bg-white rounded-2xl p-6 text-center border border-orange-100 relative z-10 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-orange-50 text-primary flex items-center justify-center mx-auto mb-4">
                  <step.icon size={28} />
                </div>
                <h3 className="font-bold text-industrial mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
