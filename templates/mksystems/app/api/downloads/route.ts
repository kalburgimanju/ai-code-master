import { NextRequest, NextResponse } from "next/server";
import { readStats, writeStats } from "@/lib/stats";

export async function GET() {
  const stats = readStats();
  return NextResponse.json({ downloads: stats.downloads.reverse() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { component, user, version } = body;

  if (!component || !user) {
    return NextResponse.json(
      { error: "component and user are required" },
      { status: 400 }
    );
  }

  const stats = readStats();
  stats.downloads.push({
    date: new Date().toISOString(),
    component,
    user: user.name || user.email || "Anonymous",
    email: user.email || "",
    version: version || "1.0.0",
    userAgent: req.headers.get("user-agent") || "",
  });
  writeStats(stats);

  return NextResponse.json({ success: true });
}
