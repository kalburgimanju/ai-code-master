import Link from "next/link";
import { instructor } from "@/lib/curriculum";

export default function AboutPage() {
  return (
    <div style={{
      maxWidth: 600,
      margin: "100px auto",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "var(--font-serif), Georgia, serif",
      color: "#555451"
    }}>
      <img
        src="https://i0.wp.com/edwarddonner.com/wp-content/uploads/2023/12/cropped-edworkprofile2.png?fit=1128%2C1128&ssl=1"
        alt={instructor.name}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: "1.5rem"
        }}
      />
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f1f1d", marginBottom: "0.5rem" }}>
        {instructor.name}
      </h1>
      <p style={{ fontSize: "1rem", color: "#787670", marginBottom: "1.5rem" }}>{instructor.title}</p>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        {instructor.bio}
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
