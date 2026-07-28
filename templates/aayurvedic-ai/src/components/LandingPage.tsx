import { useState } from 'react';

interface Feature {
  title: string;
  description: string;
}

export default function LandingPage({ onNavigateToChat, onNavigateToResources }: {
  onNavigateToChat: () => void;
  onNavigateToResources: () => void;
}) {
  const [features] = useState<Feature[]>([
    {
      title: 'Ayurvedic Treatment',
      description: 'Personalized recommendations for Neem, blood sugar control, and Ayurvedic herbs.'
    },
    {
      title: 'Traditional Knowledge Base',
      description: 'Extracted wisdom from Sushrita Samhita (Ancient Ayurvedic Texts).'
    },
    {
      title: 'Ayurvedic Herbs Database',
      description: 'Neem, Bitter Melon, Gurmar, Tulsi - all in one place with detailed information.'
    }
  ]);

  return (
    <div className="min-h-screen bg-white">
      <header className='bg-amber-600 text-white py-4'>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Ayurvedic AI Diabetes Treatment Platform</h1>
          <p className="mt-2 text-lg">Harnessing Sushruta Samhita wisdom with AI for diabetes reversal.</p>
        </div>
      </header>

      <main className="p-6">
        <section className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-3 text-amber-800">{feature.title}</h2>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg mb-4">Ready to start your Ayurvedic diabetes treatment journey?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onNavigateToChat()}
                className='px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors border border-amber-600'
              >
                Get Personalized Treatment Plan
              </button>
              <button
                onClick={() => onNavigateToResources()}
                className='px-8 py-3 bg-white text-amber-800 rounded-lg font-semibold hover:bg-amber-50 transition-colors border border-amber-600'
              >
                Learn from Ancient Texts
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 py-6 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-gray-600">
            Based on classical Ayurvedic principles | Kapha dosha balance for metabolic health
          </p>
        </div>
      </footer>
    </div>
  );
}