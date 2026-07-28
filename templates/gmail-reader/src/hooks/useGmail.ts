import { useState, useCallback } from "react";
import type { Email, EmailDetail } from "../types";

interface GmailState {
  emails: Email[];
  selectedEmail: EmailDetail | null;
  loading: boolean;
  error: string | null;
  nextPageToken: string | null;
}

export function useGmail() {
  const [state, setState] = useState<GmailState>({
    emails: [],
    selectedEmail: null,
    loading: false,
    error: null,
    nextPageToken: null,
  });

  const fetchEmails = useCallback(
    async (query?: string, pageToken?: string, account?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (pageToken) params.set("pageToken", pageToken);
        if (account) params.set("account", account);
        params.set("maxResults", "20");

        const res = await fetch(`/api/gmail/emails?${params}`);
        const data = await res.json();

        if (data.error) {
          setState((prev) => ({ ...prev, loading: false, error: data.error }));
          return;
        }

        setState((prev) => ({
          ...prev,
          emails: pageToken ? [...prev.emails, ...data.emails] : data.emails,
          nextPageToken: data.nextPageToken || null,
          loading: false,
        }));
      } catch {
        setState((prev) => ({ ...prev, loading: false, error: "Failed to fetch emails" }));
      }
    },
    []
  );

  const fetchEmailDetail = useCallback(async (id: string, account?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (account) params.set("account", account);

      const res = await fetch(`/api/gmail/emails/${id}?${params}`);
      const data = await res.json();

      if (data.error) {
        setState((prev) => ({ ...prev, loading: false, error: data.error }));
        return;
      }

      setState((prev) => ({ ...prev, selectedEmail: data, loading: false }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Failed to fetch email" }));
    }
  }, []);

  const clearSelectedEmail = useCallback(() => {
    setState((prev) => ({ ...prev, selectedEmail: null }));
  }, []);

  return {
    ...state,
    fetchEmails,
    fetchEmailDetail,
    clearSelectedEmail,
  };
}
