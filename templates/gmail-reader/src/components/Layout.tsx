import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MessageSquare,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import SearchBar from "./SearchBar";
import EmailList from "./EmailList";
import EmailDetail from "./EmailDetail";
import ChatPanel from "./ChatPanel";
import AccountSelector from "./AccountSelector";
import type { Email, Account } from "../types";

interface LayoutProps {
  email: string | null;
  accounts: Account[];
  onLogout: () => void;
  onAddAccount: () => void;
}

export default function Layout({ email, accounts, onLogout, onAddAccount }: LayoutProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("in:inbox");
  const [currentAccount, setCurrentAccount] = useState<string | null>(email); // null = all accounts
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const isAllAccounts = currentAccount === null;

  const fetchEmails = useCallback(
    async (query?: string, pageToken?: string, retryCount = 0) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("query", query || "in:inbox");

        // Use /all endpoint when no account is selected
        const endpoint = isAllAccounts ? "/api/gmail/emails/all" : "/api/gmail/emails";

        if (!isAllAccounts) {
          params.set("account", currentAccount);
        }
        if (pageToken) params.set("pageToken", pageToken);
        params.set("maxResults", "20");

        const res = await fetch(`${endpoint}?${params}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setEmails((prev) =>
            pageToken ? [...prev, ...data.emails] : data.emails
          );
          setNextPageToken(data.nextPageToken || null);
        }
      } catch {
        // Retry once if server might be starting up
        if (retryCount < 1) {
          await new Promise((r) => setTimeout(r, 2000));
          return fetchEmails(query, pageToken, retryCount + 1);
        }
        setError("Failed to fetch emails");
      } finally {
        setLoading(false);
      }
    },
    [currentAccount, isAllAccounts]
  );

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setEmails([]);
    fetchEmails(query);
  };

  const handleSelectEmail = async (emailItem: Email) => {
    try {
      const params = new URLSearchParams();
      if (emailItem.accountEmail) params.set("account", emailItem.accountEmail);
      else if (currentAccount) params.set("account", currentAccount);

      const res = await fetch(`/api/gmail/emails/${emailItem.id}?${params}`);
      const data = await res.json();
      setSelectedEmail(data);
    } catch {
      setSelectedEmail({ ...emailItem, body: emailItem.snippet });
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchEmails(searchQuery, nextPageToken);
    }
  };

  const handleAccountSwitch = (accountEmail: string | null) => {
    setCurrentAccount(accountEmail);
    setEmails([]);
    setSelectedEmail(null);
    fetchEmails(searchQuery);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Email List */}
      <div
        className={`${
          showSidebar ? "w-96" : "w-0"
        } border-r border-gray-200 bg-white flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gmail-500" />
              <h1 className="text-lg font-bold text-gray-900">Gmail Reader</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchEmails(searchQuery)}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  showChat
                    ? "text-gmail-600 bg-gmail-50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AccountSelector
            accounts={accounts}
            currentEmail={currentAccount}
            onSelect={handleAccountSwitch}
            onAddAccount={onAddAccount}
            onLogout={onLogout}
          />
        </div>

        {/* Search */}
        <div className="p-4">
          <SearchBar onSearch={handleSearch} currentQuery={searchQuery} />
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          <EmailList
            emails={emails}
            loading={loading}
            error={error}
            selectedId={selectedEmail?.id}
            onSelect={handleSelectEmail}
            onLoadMore={handleLoadMore}
            hasMore={!!nextPageToken}
            showAccountBadge={isAllAccounts}
          />
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-4 left-4 z-30 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        style={{ left: showSidebar ? "380px" : "8px" }}
      >
        {showSidebar ? (
          <X className="w-4 h-4 text-gray-600" />
        ) : (
          <Menu className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex min-w-0">
        {/* Email Detail */}
        <div className="flex-1 min-w-0">
          {selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              onBack={() => setSelectedEmail(null)}
              onAskAI={() => {
                setShowChat(true);
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-400 mb-2">
                  Select an email
                </h2>
                <p className="text-sm text-gray-300">
                  Choose an email from the list to read it here
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-96 border-l border-gray-200 flex-shrink-0">
            <ChatPanel
              emails={emails}
              selectedEmailBody={selectedEmail?.body as string | null}
            />
          </div>
        )}
      </div>
    </div>
  );
}
