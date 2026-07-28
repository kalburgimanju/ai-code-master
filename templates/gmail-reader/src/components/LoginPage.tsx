import { Mail, Sparkles, Search, MessageSquare } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gmail-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gmail-500 rounded-2xl shadow-lg shadow-gmail-500/25 mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Gmail <span className="text-gmail-600">Reader</span>
          </h1>
          <p className="text-lg text-gray-500">
            Your AI-powered email assistant
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Search, label: "Smart Search", desc: "Find any email instantly" },
            { icon: Sparkles, label: "AI Summaries", desc: "Get instant overviews" },
            { icon: MessageSquare, label: "Chat & Ask", desc: "Ask about your emails" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <Icon className="w-6 h-6 text-gmail-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-gmail-400 hover:shadow-lg hover:shadow-gmail-500/10 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          We only read your emails — we never send or modify them.
          <br />
          Your data stays on your device.
        </p>
      </div>
    </div>
  );
}
