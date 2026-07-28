import { NextResponse } from "next/server";
import { readStats } from "@/lib/stats";

export async function GET() {
  const stats = readStats();

  // Aggregate component counts
  const components: Record<string, number> = {};
  for (const entry of stats.downloads) {
    components[entry.component] = (components[entry.component] || 0) + 1;
  }

  // Unique users
  const uniqueUsers = new Set(stats.downloads.map((d) => d.email));

  return NextResponse.json({
    totalDownloads: stats.downloads.length,
    totalUsers: uniqueUsers.size,
    components,
    recentDownloads: stats.downloads.slice(-10).reverse(),
  });
}
