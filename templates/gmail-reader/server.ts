import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env.local"), override: true });
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));

// --- OpenRouter client ---
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// --- Google OAuth2 config ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// In-memory token store: accountId -> tokens
const tokenStore = new Map<
  string,
  { access_token: string; refresh_token: string; expiry_date: number; email: string }
>();

// ────────────────────────────────────────────
// AUTH ENDPOINTS
// ────────────────────────────────────────────

// Get Google OAuth URL
app.get("/api/auth/url", (_req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "consent",
  });
  res.json({ url });
});

// Exchange auth code for tokens
app.post("/api/auth/callback", async (req, res) => {
  try {
    const { code } = req.body;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const accountId = data.email || "unknown";

    // Store tokens
    tokenStore.set(accountId, {
      access_token: tokens.access_token || "",
      refresh_token: tokens.refresh_token || "",
      expiry_date: tokens.expiry_date || 0,
      email: accountId,
    });

    res.json({ success: true, email: accountId, accounts: Array.from(tokenStore.keys()) });
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(400).json({ error: "Failed to exchange auth code" });
  }
});

// Get list of connected accounts
app.get("/api/auth/accounts", (_req, res) => {
  const accounts = Array.from(tokenStore.values()).map((t) => ({
    email: t.email,
  }));
  res.json({ accounts });
});

// ────────────────────────────────────────────
// GMAIL ENDPOINTS
// ────────────────────────────────────────────

function getGmailClient(accountEmail?: string) {
  const account = accountEmail
    ? tokenStore.get(accountEmail)
    : tokenStore.values().next().value;

  if (!account) {
    throw new Error("No authenticated account found");
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return { gmail: google.gmail({ version: "v1", auth }), auth, account };
}

// Fetch emails (list)
app.get("/api/gmail/emails", async (req, res) => {
  try {
    const { account, query, pageToken, maxResults } = req.query;
    const { gmail } = getGmailClient(account as string | undefined);

    const response = await gmail.users.messages.list({
      userId: "me",
      q: (query as string) || "in:inbox",
      pageToken: pageToken as string | undefined,
      maxResults: parseInt(maxResults as string) || 20,
    });

    const messages = response.data.messages || [];

    // Fetch details for each message
    const emails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });
        const headers = detail.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

        return {
          id: msg.id,
          snippet: detail.data.snippet,
          from: getHeader("From"),
          to: getHeader("To"),
          subject: getHeader("Subject"),
          date: getHeader("Date"),
          labels: detail.data.labelIds,
          unread: detail.data.labelIds?.includes("UNREAD"),
        };
      })
    );

    res.json({
      emails,
      nextPageToken: response.data.nextPageToken,
      totalEstimate: response.data.resultSizeEstimate,
    });
  } catch (error: any) {
    console.error("Fetch emails error:", error?.message || error);
    const message = error?.message || "Failed to fetch emails";
    res.status(500).json({ error: message });
  }
});

// Fetch emails from ALL connected accounts (merged & sorted by date)
app.get("/api/gmail/emails/all", async (req, res) => {
  try {
    const { query, maxResults } = req.query;
    const q = (query as string) || "in:inbox";
    const limit = parseInt(maxResults as string) || 30;

    if (tokenStore.size === 0) {
      return res.json({ emails: [], nextPageToken: null });
    }

    // Fetch from all accounts in parallel
    const accountEmails = Array.from(tokenStore.keys());
    const results = await Promise.allSettled(
      accountEmails.map(async (email) => {
        const { gmail } = getGmailClient(email);
        const response = await gmail.users.messages.list({
          userId: "me",
          q,
          maxResults: limit,
        });
        const messages = response.data.messages || [];

        const details = await Promise.all(
          messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
              userId: "me",
              id: msg.id!,
              format: "metadata",
              metadataHeaders: ["From", "To", "Subject", "Date"],
            });
            const headers = detail.data.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

            return {
              id: msg.id,
              snippet: detail.data.snippet,
              from: getHeader("From"),
              to: getHeader("To"),
              subject: getHeader("Subject"),
              date: getHeader("Date"),
              labels: detail.data.labelIds,
              unread: detail.data.labelIds?.includes("UNREAD"),
              accountEmail: email,
            };
          })
        );
        return details;
      })
    );

    // Flatten and sort by date (newest first)
    const allEmails = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    res.json({ emails: allEmails, nextPageToken: null });
  } catch (error: any) {
    console.error("Fetch all emails error:", error?.message || error);
    res.status(500).json({ error: error?.message || "Failed to fetch emails" });
  }
});

// Fetch single email (full content)
app.get("/api/gmail/emails/:id", async (req, res) => {
  try {
    const { account } = req.query;
    const { gmail } = getGmailClient(account as string | undefined);

    const response = await gmail.users.messages.get({
      userId: "me",
      id: req.params.id,
      format: "full",
    });

    const headers = response.data.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

    // Extract body
    let body = "";
    const extractBody = (part: any): string => {
      if (part.body?.data) {
        return Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
      if (part.parts) {
        // Prefer text/plain, fallback to text/html
        const textPart = part.parts.find((p: any) => p.mimeType === "text/plain");
        if (textPart) return extractBody(textPart);
        const htmlPart = part.parts.find((p: any) => p.mimeType === "text/html");
        if (htmlPart) return extractBody(htmlPart);
        return part.parts.map(extractBody).join("");
      }
      return "";
    };

    body = extractBody(response.data.payload);

    res.json({
      id: response.data.id,
      snippet: response.data.snippet,
      from: getHeader("From"),
      to: getHeader("To"),
      subject: getHeader("Subject"),
      date: getHeader("Date"),
      body,
      labels: response.data.labelIds,
      headers: Object.fromEntries(headers.map((h) => [h.name, h.value])),
    });
  } catch (error) {
    console.error("Fetch email error:", error);
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

// ────────────────────────────────────────────
// AI ENDPOINTS
// ────────────────────────────────────────────

app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, emails, model } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Build email context
    const emailContext = emails
      ?.map(
        (e: any, i: number) =>
          `Email ${i + 1}:\nFrom: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nSnippet: ${e.snippet}\nBody: ${e.body || "N/A"}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `You are an AI email assistant. You help users understand, summarize, and find information in their emails. Be concise and helpful. When referencing specific emails, mention the sender and subject.`;

    const userMessage = emailContext
      ? `Here are the user's emails:\n\n${emailContext}\n\n---\n\nUser question: ${question}`
      : question;

    const stream = await openai.chat.completions.create({
      model: model || "google/gemini-2.5-flash",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("AI ask error:", error?.message || error);
    res.status(500).json({ error: error?.message || "Failed to process AI request" });
  }
});

app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { emails, model } = req.body;

    if (!emails?.length) {
      return res.status(400).json({ error: "Emails are required" });
    }

    const emailContext = emails
      .map(
        (e: any, i: number) =>
          `Email ${i + 1}:\nFrom: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nSnippet: ${e.snippet}\nBody: ${e.body || "N/A"}`
      )
      .join("\n\n---\n\n");

    const stream = await openai.chat.completions.create({
      model: model || "google/gemini-2.5-flash",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are an AI email assistant. Summarize the provided emails in a clear, organized way. Group by topic if relevant. Highlight important action items, deadlines, and key information.",
        },
        {
          role: "user",
          content: `Please summarize these ${emails.length} email(s):\n\n${emailContext}`,
        },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("AI summarize error:", error);
    res.status(500).json({ error: "Failed to summarize emails" });
  }
});

// Available models endpoint
app.get("/api/ai/models", (_req, res) => {
  res.json({
    models: [
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
      { id: "google/gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", provider: "Google" },
      { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", provider: "Anthropic" },
      { id: "openai/gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "OpenAI" },
    ],
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", accounts: tokenStore.size });
});

app.listen(PORT, () => {
  console.log(`Gmail Reader API running on http://localhost:${PORT}`);
});
