import { useState } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function ResourcesPage({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;
    const newMessage: Message = { id: Date.now(), role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setLoading(true);
    const response = 'Simulated Ayurvedic advice from Sushrita Samhita.';
    const assistantMessage: Message = { id: Date.now() + 1, role: 'assistant', content: response };
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setLoading(false);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className='bg-amber-600 text-white py-4'>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Ayurvedic Diabetes Knowledge</h1>
        </div>
      </header>
      <main className="p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg">
            The <em>Sushruta Samhita</em> is an ancient Ayurvedic text that describes <strong>Madhumeha</strong> (diabetes) in detail, including its signs, causes, and natural treatment approaches using herbs like <strong>Neem</strong>, <strong>Gurmar</strong>, and <strong>Bitter Melon</strong>.
          </p>
          <p className="mt-4">
            Ayurvedic treatment focuses on balancing the <strong>Kapha dosha</strong> through diet, lifestyle, and herbal formulations. Our platform provides personalized treatment plans based on these principles.
          </p>
          <p className="mt-4">
            You can explore <strong>researched studies</strong> on how Ayurvedic interventions can help manage blood sugar levels.
          </p>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Ask about Ayurvedic Diabetes Treatment</h2>
            <div className="flex flex-col gap-4">
              <div className="flex-1 overflow-y-auto max-h-64 border rounded p-4 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>\n                    <strong>{msg.role === 'user' ? 'You' : 'Ayurvedic AI'}:</strong> {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type='text'
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder='Ask about Neem, Bitter Melon, or other Ayurvedic herbs...'
                  className='flex-1 px-4 py-2 border rounded'
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className='px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-gray-400'
                >
                  {loading ? "…" : "Send"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onBack}
              className="px-5 py-2 bg-white text-amber-800 border-2 border-amber-600 rounded hover:bg-amber-50"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}