import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../lib/api";
import type { LessonPlan } from "../lib/types";

export default function Dashboard() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPlans().then(setPlans).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan and all its lessons?")) return;
    await api.deletePlan(id);
    setPlans(plans.filter((p) => p.id !== id));
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    generated: "bg-primary/20 text-primary",
    error: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your video lesson plans</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + New Plan
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No lesson plans yet</p>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/plan/${plan.id}`} className="text-lg font-semibold hover:text-primary transition-colors">
                    {plan.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{plan.prompt}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[plan.status] || "bg-muted text-muted-foreground"}`}>
                      {plan.status}
                    </span>
                    {plan.ai_model && <span className="text-xs text-muted-foreground">{plan.ai_model}</span>}
                    <span className="text-xs text-muted-foreground">{new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
