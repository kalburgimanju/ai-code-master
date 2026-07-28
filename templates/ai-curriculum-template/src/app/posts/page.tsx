import Link from "next/link";

export default function PostsPage() {
  return (
    <div style={{
      maxWidth: 600,
      margin: "100px auto",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "var(--font-serif), Georgia, serif",
      color: "#555451"
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f1f1d", marginBottom: "1rem" }}>Posts</h1>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        Thoughts, tutorials, and insights about AI engineering, agents, and building with LLMs.
      </p>
      <p style={{ marginBottom: "2rem" }}>Blog posts coming soon.</p>
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
