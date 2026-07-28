import { useState } from "react";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { PromptInput } from "../components/PromptInput";

export default function CreatePlan() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (title: string, prompt: string, numLessons: number) => {
    setLoading(true);
    setError("");
    try {
      const result = await api.generatePlan(title, prompt, numLessons);
      navigate(`/plan/${result.plan.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Create Lesson Plan</h1>
      <p className="text-muted-foreground mb-8">
        Enter your video series title and requirements. The AI will generate a complete lesson plan.
      </p>

      <div className="p-6 rounded-xl border border-border bg-card">
        <PromptInput onSubmit={handleGenerate} loading={loading} />
        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
      </div>

      <div className="mt-8 p-5 rounded-xl border border-border bg-card/50">
        <h3 className="font-semibold mb-3">Tips for better results</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Be specific about your target audience (beginners, intermediate, advanced)</li>
          <li>• Mention the style you prefer (tutorial, lecture, hands-on coding)</li>
          <li>• Include any specific topics or tools you want covered</li>
          <li>• Specify the desired video length per lesson</li>
        </ul>
      </div>
    </div>
  );
}
