import { Mail, MailOpen, Clock } from "lucide-react";
import type { Email } from "../types";

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (email: Email) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  showAccountBadge?: boolean;
}

// Consistent color palette for account badges
const BADGE_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getBadgeColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function extractName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.split("@")[0];
}

export default function EmailList({
  emails,
  loading,
  error,
  selectedId,
  onSelect,
  onLoadMore,
  hasMore,
  showAccountBadge = false,
}: EmailListProps) {
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-sm mb-2">Failed to load emails</div>
        <p className="text-gray-400 text-xs">{error}</p>
      </div>
    );
  }

  if (!loading && emails.length === 0) {
    return (
      <div className="p-12 text-center">
        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No emails found</p>
        <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {emails.map((email) => (
        <button
          key={`${email.accountEmail || ""}-${email.id}`}
          onClick={() => onSelect(email)}
          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
            selectedId === email.id ? "bg-gmail-50 border-r-2 border-gmail-500" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {email.unread ? (
                <Mail className="w-4 h-4 text-gmail-500" />
              ) : (
                <MailOpen className="w-4 h-4 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm truncate ${
                    email.unread ? "font-semibold text-gray-900" : "text-gray-700"
                  }`}
                >
                  {extractName(email.from)}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatDate(email.date)}
                </span>
              </div>
              <p
                className={`text-sm truncate mt-0.5 ${
                  email.unread ? "font-medium text-gray-800" : "text-gray-600"
                }`}
              >
                {email.subject || "(no subject)"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400 truncate flex-1">{email.snippet}</p>
                {showAccountBadge && email.accountEmail && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${getBadgeColor(
                      email.accountEmail
                    )}`}
                  >
                    {email.accountEmail.split("@")[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}

      {hasMore && (
        <div className="p-4 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm text-gmail-600 hover:text-gmail-700 font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {loading && emails.length === 0 && (
        <div className="p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-gmail-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Loading emails...</p>
        </div>
      )}
    </div>
  );
}
