import { useState } from "react";

interface Props {
  onSubmit: (title: string, prompt: string, numLessons: number) => void;
  loading: boolean;
}

export function PromptInput({ onSubmit, loading }: Props) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [numLessons, setNumLessons] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;
    onSubmit(title.trim(), prompt.trim(), numLessons);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Video Series Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Python for Beginners"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Prompt / Requirements</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want the lesson plan to cover, target audience, style, etc."
          rows={4}
          required
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Number of Lessons</label>
          <input
            type="number"
            value={numLessons}
            onChange={(e) => setNumLessons(Number(e.target.value))}
            min={1}
            max={20}
            className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Generating...
            </>
          ) : (
            "Generate Lesson Plan"
          )}
        </button>
      </div>
    </form>
  );
}
