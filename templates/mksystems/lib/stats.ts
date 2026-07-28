import fs from "fs";
import path from "path";

export interface DownloadEntry {
  date: string;
  component: string;
  user: string;
  email: string;
  version: string;
  userAgent: string;
}

export interface StatsData {
  downloads: DownloadEntry[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STATS_FILE = path.join(DATA_DIR, "stats.json");

export function readStats(): StatsData {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Fall through to defaults
  }
  return { downloads: [] };
}

export function writeStats(stats: StatsData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error("Failed to write stats:", err);
  }
}
