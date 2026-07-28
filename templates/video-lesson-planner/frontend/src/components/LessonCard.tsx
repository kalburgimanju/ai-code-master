import type { Lesson } from "../lib/types";
import { Link } from "wouter";

export function LessonCard({
  lesson,
  planId,
  onGenerateScript,
  generatingScript,
}: {
  lesson: Lesson;
  planId: string;
  onGenerateScript?: (lessonId: string) => void;
  generatingScript?: boolean;
}) {
  const statusColors: Record<string, string> = {
    planned: "bg-secondary text-secondary-foreground",
    recorded: "bg-accent/20 text-accent",
    uploaded: "bg-green-900/30 text-green-400",
  };

  const hasScript = !!lesson.full_script;

  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {lesson.lesson_number}
          </span>
          <h3 className="font-semibold">{lesson.title}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[lesson.status] || "bg-muted text-muted-foreground"}`}>
          {lesson.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lesson.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
        <div className="flex gap-2">
          <button
            onClick={() => onGenerateScript?.(lesson.id)}
            disabled={generatingScript}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              hasScript
                ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                : "bg-accent/20 text-accent hover:bg-accent/30"
            } disabled:opacity-50`}
          >
            {generatingScript
              ? "Generating..."
              : hasScript
                ? "Regenerate Script"
                : "Generate Script"}
          </button>
          <Link
            href={`/upload/${lesson.id}`}
            className="text-xs px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Upload Video
          </Link>
        </div>
      </div>
    </div>
  );
}
