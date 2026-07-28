import { ArrowLeft, ExternalLink, Bot } from "lucide-react";
import type { EmailDetail as EmailDetailType } from "../types";

interface EmailDetailProps {
  email: EmailDetailType;
  onBack: () => void;
  onAskAI: (context: string) => void;
}

function extractName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from;
}

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

export default function EmailDetail({ email, onBack, onAskAI }: EmailDetailProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 flex-1 truncate">
            {email.subject || "(no subject)"}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gmail-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gmail-700">
                {extractName(email.from).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {extractName(email.from)}
              </p>
              <p className="text-xs text-gray-400">{extractEmail(email.from)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAI(email.body || email.snippet)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gmail-50 text-gmail-700 text-xs font-medium rounded-lg hover:bg-gmail-100 transition-colors cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask AI
            </button>
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Gmail
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>To: {email.to}</span>
          <span>{email.date}</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {email.body ? (
          <div
            className="email-content prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }}
          />
        ) : (
          <p className="text-gray-500 text-sm">{email.snippet}</p>
        )}
      </div>
    </div>
  );
}

function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}
