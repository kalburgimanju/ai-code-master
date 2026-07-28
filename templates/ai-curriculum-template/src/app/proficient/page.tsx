import Link from "next/link";
import { siteConfig } from "@/lib/curriculum";

export default function ProficientPage() {
  return (
    <div style={{
      maxWidth: 600,
      margin: "100px auto",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "var(--font-serif), Georgia, serif",
      color: "#555451"
    }}>
      <div style={{
        width: 4,
        height: 40,
        background: "#0693e3",
        margin: "0 auto 1rem"
      }}></div>
      <div style={{
        color: "#787670",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontSize: "0.75rem",
        fontWeight: 600,
        marginBottom: "1rem"
      }}>The destination</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f1f1d", marginBottom: "1rem" }}>
        Proficient AI Engineer
      </h1>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        Complete all six milestones, build and deploy real world projects, and you are positioned for success as an AI Engineer.
        Join the directory of proficient AI engineers.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {["AI Builder", "AI Coder", "AI Leader", "Core Track", "Agentic Track", "Production Track"].map((c) => (
          <span key={c} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9rem",
            color: "#787670"
          }}>
            <span style={{ color: "#0693e3", fontWeight: 700 }}>✓</span> {c}
          </span>
        ))}
      </div>
      <Link href="/" style={{
        display: "inline-block",
        padding: "0.5rem 1.5rem",
        background: "#ecad0a",
        color: "#1f1f1d",
        borderRadius: 999,
        textDecoration: "none",
        fontWeight: 600
      }}>← Back to Curriculum</Link>
    </div>
  );
}
