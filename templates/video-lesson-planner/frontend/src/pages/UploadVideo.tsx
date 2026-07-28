import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { api } from "../lib/api";
import type { Lesson } from "../lib/types";
import { VideoUploader } from "../components/VideoUploader";

export default function UploadVideo() {
  const params = useParams<{ lessonId: string }>();
  const [, navigate] = useLocation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [planId, setPlanId] = useState("");
  const [youtubeStatus, setYoutubeStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.youtubeStatus().then((s) => setYoutubeStatus(s.authenticated)).catch(() => {});
    // Find the plan that owns this lesson so we can pass planId to the uploader.
    api
      .listPlans()
      .then(async (plans) => {
        for (const p of plans) {
          const detail = await api.getPlan(p.id).catch(() => null);
          const found = detail?.lessons.find((l) => l.id === params.lessonId);
          if (found) {
            setPlanId(p.id);
            setLesson(found);
            break;
          }
        }
      })
      .finally(() => setLoading(false));
  }, [params.lessonId]);

  const handleAuth = async () => {
    const { auth_url } = await api.getYouTubeAuthUrl();
    window.open(auth_url, "_blank");
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
      <p className="text-muted-foreground mb-8">Upload your recorded lesson to YouTube.</p>

      {!youtubeStatus ? (
        <div className="p-8 rounded-xl border border-border bg-card text-center">
          <p className="text-muted-foreground mb-4">YouTube is not connected yet.</p>
          <button
            onClick={handleAuth}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Connect YouTube Account
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            This will open Google OAuth2 to authorize access to your YouTube channel.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-border bg-card">
          {planId && lesson ? (
            <VideoUploader
              planId={planId}
              lessonId={params.lessonId || ""}
              lessonTitle={lesson.title || "Untitled Lesson"}
              onUploaded={() => navigate("/")}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Lesson not found. It may have been deleted.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
