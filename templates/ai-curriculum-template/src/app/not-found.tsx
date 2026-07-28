import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      maxWidth: 500,
      margin: "100px auto",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "var(--font-serif), Georgia, serif",
      color: "#555451"
    }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 900, color: "#d9d9d6", marginBottom: "0.5rem" }}>404</h1>
      <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "#1f1f1d", marginBottom: "1rem" }}>
        Page not found
      </p>
      <p style={{ fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        The page you are looking for does not exist or has been moved.
      </p>
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
