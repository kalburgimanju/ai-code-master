import { useState, useEffect, useCallback } from "react";
import type { Account } from "../types";

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    accounts: [],
    loading: true,
    error: null,
  });

  // Check for auth callback code in URL, or restore session from localStorage
  const handleCallback = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // OAuth callback — exchange code for tokens
      try {
        const res = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem("gmail_reader_email", data.email);
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            email: data.email,
            loading: false,
          }));
          window.history.replaceState({}, "", "/");
        } else {
          setState((prev) => ({ ...prev, loading: false, error: "Authentication failed" }));
        }
      } catch {
        setState((prev) => ({ ...prev, loading: false, error: "Authentication failed" }));
      }
    } else {
      // No callback — restore session from localStorage (trust it)
      const storedEmail = localStorage.getItem("gmail_reader_email");
      if (storedEmail) {
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          email: storedEmail,
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  // Fetch connected accounts (runs after auth is confirmed)
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/accounts");
      const data = await res.json();
      setState((prev) => ({ ...prev, accounts: data.accounts || [] }));
    } catch {
      // Silently fail — don't log user out on network errors
    }
  }, []);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchAccounts();
    }
  }, [state.isAuthenticated, fetchAccounts]);

  const login = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/url");
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setState((prev) => ({ ...prev, error: "Failed to initiate login" }));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gmail_reader_email");
    setState({
      isAuthenticated: false,
      email: null,
      accounts: [],
      loading: false,
      error: null,
    });
  }, []);

  return { ...state, login, logout, fetchAccounts };
}
