import Link from "next/link";

export default function ConnectFourPage() {
  return (
    <div style={{
      maxWidth: 600,
      margin: "100px auto",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "var(--font-serif), Georgia, serif",
      color: "#555451"
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f1f1d", marginBottom: "1rem" }}>C4 — Connect Four</h1>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        A Connect Four game played by AI agents. Watch LLMs compete in a classic game of strategy.
      </p>
      <p style={{ marginBottom: "2rem" }}>Coming soon — the AI vs AI Connect Four arena.</p>
      <Link href="/" style={{
        display: "inline-block",
        padding: "0.5rem 1.5rem",
        background: "#1f1f1d",
        color: "#fff",
        borderRadius: 999,
        textDecoration: "none",
        fontWeight: 600
      }}>← Back to Curriculum</Link>
    </div>
  );
}
