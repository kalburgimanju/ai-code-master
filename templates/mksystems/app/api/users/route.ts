import { NextResponse } from "next/server";
import { readStats } from "@/lib/stats";

export async function GET() {
  const stats = readStats();

  // Aggregate user data
  const userMap = new Map<
    string,
    { email: string; name: string; lastActive: string; downloads: number; components: Set<string> }
  >();

  for (const entry of stats.downloads) {
    const key = entry.email || entry.user;
    if (!userMap.has(key)) {
      userMap.set(key, {
        email: entry.email || "",
        name: entry.user,
        lastActive: entry.date,
        downloads: 0,
        components: new Set(),
      });
    }
    const user = userMap.get(key)!;
    user.downloads++;
    user.components.add(entry.component);
    if (new Date(entry.date) > new Date(user.lastActive)) {
      user.lastActive = entry.date;
    }
  }

  const users = Array.from(userMap.values())
    .map((u) => ({
      ...u,
      components: Array.from(u.components),
    }))
    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

  return NextResponse.json({ users });
}
