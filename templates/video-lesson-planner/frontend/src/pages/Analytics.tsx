import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { YouTubeVideo } from "../lib/types";

export default function Analytics() {
  const [plans, setPlans] = useState<{ id: string; title: string; lessons: { id: string; title: string; video?: YouTubeVideo | null }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const allPlans = await api.listPlans();
    const plansWithLessons = await Promise.all(
      allPlans.map((p) => api.getPlan(p.id).catch(() => ({ ...p, lessons: [] })))
    );
    setPlans(plansWithLessons);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await api.refreshAnalytics();
    await loadPlans();
    setRefreshing(false);
  };

  const allVideos = plans.flatMap((p) =>
    p.lessons.filter((l) => l.video).map((l) => ({ ...l.video!, lessonTitle: l.title, planTitle: p.title }))
  );

  const totalViews = allVideos.reduce((s, v) => s + v.view_count, 0);
  const totalLikes = allVideos.reduce((s, v) => s + v.like_count, 0);

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">YouTube video performance metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh Analytics"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : allVideos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="mb-2">No uploaded videos yet</p>
          <p className="text-sm">Upload a video from a lesson plan to see analytics here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-border bg-card text-center">
              <p className="text-3xl font-bold text-primary">{allVideos.length}</p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card text-center">
              <p className="text-3xl font-bold text-primary">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card text-center">
              <p className="text-3xl font-bold text-primary">{totalLikes.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Likes</p>
            </div>
          </div>

          <div className="space-y-3">
            {allVideos.map((v) => (
              <div key={v.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{v.planTitle}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">{v.view_count.toLocaleString()} views</span>
                  <span className="text-muted-foreground">{v.like_count.toLocaleString()} likes</span>
                  <span className="text-muted-foreground">{v.comment_count.toLocaleString()} comments</span>
                  <a
                    href={`https://youtube.com/watch?v=${v.youtube_video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Watch
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
