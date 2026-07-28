import { useState } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;
    const newUserMessage: Message = { id: Date.now(), role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
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
        <h1 className='text-xl font-bold text-center max-w-3xl mx-auto px-4'>Ayurvedic AI Diabetes Assistant</h1>
      </header>
      <div className="flex flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          {messages.map((msg) => (
            <div key={msg.id} className='p-2 rounded bg-white'>
              {msg.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2 py-2">
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Enter your query'
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
  );
}