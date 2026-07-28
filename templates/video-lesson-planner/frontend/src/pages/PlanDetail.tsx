import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { api } from "../lib/api";
import type { Lesson, LessonPlan } from "../lib/types";
import { LessonCard } from "../components/LessonCard";

export default function PlanDetail() {
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<(LessonPlan & { lessons: Lesson[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Lesson>>({});
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [viewingScript, setViewingScript] = useState<string | null>(null);
  const [generatingPpt, setGeneratingPpt] = useState<string | null>(null);
  const [uploadingDrive, setUploadingDrive] = useState<string | null>(null);
  const [scriptError, setScriptError] = useState("");

  useEffect(() => {
    if (params.id) {
      api.getPlan(params.id).then(setPlan).finally(() => setLoading(false));
    }
  }, [params.id]);

  const startEdit = (lesson: Lesson) => {
    setEditingLesson(lesson.id);
    setEditData({
      title: lesson.title,
      description: lesson.description,
      key_points: lesson.key_points,
      talking_points: lesson.talking_points,
      script_outline: lesson.script_outline,
      duration_minutes: lesson.duration_minutes,
    });
  };

  const saveEdit = async (lessonId: string) => {
    if (!plan) return;
    const updated = await api.updateLesson(plan.id, lessonId, editData);
    setPlan({
      ...plan,
      lessons: plan.lessons.map((l) => (l.id === lessonId ? { ...l, ...updated } : l)),
    });
    setEditingLesson(null);
  };

  const handleGenerateScript = async (lessonId: string) => {
    if (!plan) return;
    setGeneratingScript(lessonId);
    setScriptError("");
    try {
      const result = await api.generateScript(plan.id, lessonId);
      setPlan({
        ...plan,
        lessons: plan.lessons.map((l) =>
          l.id === lessonId ? { ...l, full_script: result.lesson.full_script, script_author: result.lesson.script_author } : l
        ),
      });
      setViewingScript(lessonId);
    } catch (err: unknown) {
      setScriptError(err instanceof Error ? err.message : "Script generation failed");
    } finally {
      setGeneratingScript(null);
    }
  };

  const handleGeneratePpt = async (lessonId: string) => {
    if (!plan) return;
    setGeneratingPpt(lessonId);
    setScriptError("");
    try {
      const result = await api.generatePpt(plan.id, lessonId);
      setPlan({
        ...plan,
        lessons: plan.lessons.map((l) => (l.id === lessonId ? { ...l, ppt_path: result.ppt_path } : l)),
      });
    } catch (err: unknown) {
      setScriptError(err instanceof Error ? err.message : "PPT generation failed");
    } finally {
      setGeneratingPpt(null);
    }
  };

  const handleUploadToDrive = async (lessonId: string) => {
    if (!plan) return;
    setUploadingDrive(lessonId);
    setScriptError("");
    try {
      const result = await api.uploadToDrive(plan.id, lessonId);
      setPlan({
        ...plan,
        lessons: plan.lessons.map((l) =>
          l.id === lessonId
            ? { ...l, drive_script_link: result.script_doc_link, drive_ppt_link: result.ppt_file_link }
            : l
        ),
      });
      if (result.script_doc_link) window.open(result.script_doc_link, "_blank");
    } catch (err: unknown) {
      setScriptError(err instanceof Error ? err.message : "Drive upload failed");
    } finally {
      setUploadingDrive(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  if (!plan) return <div className="text-center py-20 text-muted-foreground">Plan not found</div>;

  const totalMinutes = plan.lessons.reduce((sum, l) => sum + l.duration_minutes, 0);
  const activeLesson = plan.lessons.find((l) => l.id === viewingScript);

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
        <p className="text-muted-foreground">{plan.prompt}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{plan.status}</span>
          <span className="text-sm text-muted-foreground">{plan.lessons.length} lessons &middot; {totalMinutes} min total</span>
          {plan.ai_model && <span className="text-xs text-muted-foreground">{plan.ai_model}</span>}
        </div>
      </div>

      {scriptError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {scriptError}
        </div>
      )}

      <div className="space-y-4">
        {plan.lessons.map((lesson) => (
          <div key={lesson.id}>
            {editingLesson === lesson.id ? (
              <div className="p-5 rounded-xl border border-primary bg-card space-y-3">
                <input
                  value={editData.title || ""}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  value={editData.description || ""}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Key Points</label>
                  <textarea
                    value={(editData.key_points || []).join("\n")}
                    onChange={(e) => setEditData({ ...editData, key_points: e.target.value.split("\n").filter(Boolean) })}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Script Outline</label>
                  <textarea
                    value={editData.script_outline || ""}
                    onChange={(e) => setEditData({ ...editData, script_outline: e.target.value })}
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(lesson.id)}
                    className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLesson(null)}
                    className="text-xs px-3 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group">
                <LessonCard
                  lesson={lesson}
                  planId={plan.id}
                  onGenerateScript={handleGenerateScript}
                  generatingScript={generatingScript === lesson.id}
                />
                <div className="ml-14 flex gap-3 mt-1">
                  <button
                    onClick={() => startEdit(lesson)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Edit lesson
                  </button>
                  {lesson.full_script && (
                    <button
                      onClick={() => setViewingScript(viewingScript === lesson.id ? null : lesson.id)}
                      className="text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      {viewingScript === lesson.id ? "Hide Script" : "View Script"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Script Display Panel */}
            {viewingScript === lesson.id && lesson.full_script && (
              <div className="mt-3 p-5 rounded-xl border border-accent/30 bg-card/80">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">
                    Full Script — Lesson {lesson.lesson_number}: {lesson.title}
                  </h4>
                  {lesson.script_author && (
                    <span className="text-xs text-muted-foreground">by {lesson.script_author}</span>
                  )}
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  {lesson.script_image && (
                    <img
                      src={`data:image/png;base64,${lesson.script_image}`}
                      alt={`Illustration for ${lesson.title}`}
                      className="w-full max-h-72 object-cover rounded-lg mb-4 border border-border"
                    />
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-[inherit]">
                    {lesson.full_script}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleGenerateScript(lesson.id)}
                    disabled={generatingScript === lesson.id}
                    className="text-xs px-3 py-1 rounded-md bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-50"
                  >
                    {generatingScript === lesson.id ? "Regenerating..." : "Regenerate Script"}
                  </button>
                  <button
                    onClick={() => handleGeneratePpt(lesson.id)}
                    disabled={generatingPpt === lesson.id}
                    className="text-xs px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {generatingPpt === lesson.id ? "Generating PPT..." : "Generate PPT"}
                  </button>
                  {lesson.ppt_path && (
                    <a
                      href={`/api/plans/${plan.id}/lessons/${lesson.id}/ppt`}
                      download
                      className="text-xs px-3 py-1 rounded-md bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors"
                    >
                      Download PPT
                    </a>
                  )}
                  {lesson.full_script && lesson.ppt_path && (
                    <button
                      onClick={() => handleUploadToDrive(lesson.id)}
                      disabled={uploadingDrive === lesson.id}
                      className="text-xs px-3 py-1 rounded-md bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                    >
                      {uploadingDrive === lesson.id ? "Uploading..." : "Upload to Drive"}
                    </button>
                  )}
                  {lesson.drive_script_link && (
                    <a
                      href={lesson.drive_script_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1 rounded-md bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 transition-colors"
                    >
                      View on Drive
                    </a>
                  )}
                  <button
                    onClick={() => setViewingScript(null)}
                    className="text-xs px-3 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
