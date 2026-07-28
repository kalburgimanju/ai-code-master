import { ChevronDown, Plus, LogOut, Users } from "lucide-react";
import { useState } from "react";
import type { Account } from "../types";

interface AccountSelectorProps {
  accounts: Account[];
  currentEmail: string | null;
  onSelect: (email: string | null) => void;
  onAddAccount: () => void;
  onLogout: () => void;
}

export default function AccountSelector({
  accounts,
  currentEmail,
  onSelect,
  onAddAccount,
  onLogout,
}: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isAllAccounts = currentEmail === null;
  const displayEmail = isAllAccounts ? "All Accounts" : currentEmail;
  const displayInitial = isAllAccounts ? "ALL" : currentEmail?.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isAllAccounts ? "bg-gmail-500" : "bg-gmail-100"}`}>
          {isAllAccounts ? (
            <Users className="w-3.5 h-3.5 text-white" />
          ) : (
            <span className="text-xs font-semibold text-gmail-700">{displayInitial}</span>
          )}
        </div>
        <span className="text-xs text-gray-600 truncate max-w-[140px]">
          {isAllAccounts ? `All (${accounts.length})` : displayEmail?.split("@")[0] || "Unknown"}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {/* All Accounts option */}
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer ${
                isAllAccounts ? "bg-gmail-50 text-gmail-700 font-medium" : "text-gray-700"
              }`}
            >
              <div className="w-6 h-6 bg-gmail-500 rounded-full flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span>All Accounts ({accounts.length})</span>
            </button>

            <div className="border-t border-gray-100" />

            {/* Individual accounts */}
            {accounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  onSelect(account.email);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer ${
                  account.email === currentEmail ? "bg-gmail-50 text-gmail-700" : "text-gray-700"
                }`}
              >
                <div className="w-6 h-6 bg-gmail-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gmail-700">
                    {account.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="truncate">{account.email}</span>
              </button>
            ))}

            <div className="border-t border-gray-100">
              <button
                onClick={() => {
                  onAddAccount();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add another account
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
