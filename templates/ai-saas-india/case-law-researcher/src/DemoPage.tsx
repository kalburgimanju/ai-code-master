import { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Landmark,
  Loader2,
  AlertTriangle,
  BookOpen,
  Scale,
  FileText,
  ChevronRight,
} from "lucide-react";

const COURTS = [
  "All Courts",
  "Supreme Court of India",
  "Bombay High Court",
  "Delhi High Court",
  "Madras High Court",
  "Calcutta High Court",
  "Karnataka High Court",
  "Kerala High Court",
  "Allahabad High Court",
  "Gujarat High Court",
  "Andhra Pradesh High Court",
  "Telangana High Court",
];

const YEARS = ["All Years", "2026", "2025", "2024", "2023", "2022", "2021", "2020"];

const SAMPLE_QUERIES = [
  "Section 138 NI Act dishonoured cheque",
  "Article 21 right to privacy",
  "Consumer Protection Act defective goods",
  "Section 498A cruelty by husband",
  "Arbitration clause enforceability",
  "Environmental clearance NGT",
];

interface CaseResult {
  id: number;
  caseName: string;
  court: string;
  date: string;
  citation: string;
  summary: string;
  keyPrinciples: string[];
  ratioDecidendi: string;
  relatedSections: string[];
}

const DEMO_RESULTS: CaseResult[] = [
  {
    id: 1,
    caseName: "Dashrath Rupsingh Rathod v. State of Maharashtra",
    court: "Supreme Court of India",
    date: "2014-05-01",
    citation: "(2014) 9 SCC 129",
    summary:
      "The Supreme Court held that in cases under Section 138 of the Negotiable Instruments Act, the complaint must be filed at the court within whose jurisdiction the cheque was dishonoured, i.e., where the drawee bank is located. This judgment was later referred to a larger bench.",
    keyPrinciples: [
      "Territorial jurisdiction under Section 138 NI Act is determined by the location of the drawee bank",
      "The cause of action arises at the place where the cheque is dishonoured",
      "The complainant cannot file the case at the place of collection bank",
    ],
    ratioDecidendi:
      "The offence under Section 138 is complete at the point of dishonour of the cheque at the drawee bank. Therefore, the territorial jurisdiction vests exclusively at the place where the cheque was dishonoured.",
    relatedSections: ["Section 138 NI Act", "Section 142 NI Act", "Section 145 NI Act"],
  },
  {
    id: 2,
    caseName: "M/s Meters and Instruments Pvt. Ltd. v. Kanchan Mehta",
    court: "Supreme Court of India",
    date: "2018-01-23",
    citation: "(2018) 1 SCC 560",
    summary:
      "The Supreme Court provided guidelines for dealing with Section 138 NI Act cases, including the option for compounding of offences at every stage. The court emphasised that the object of the Act is to ensure prompt payment and not to punish the drawer.",
    keyPrinciples: [
      "The object of Section 138 is to ensure prompt payment, not punishment",
      "Compounding of offences can be permitted at every stage of the trial",
      "Trial courts should consider dispensing with formal evidence when facts are undisputed",
    ],
    ratioDecidendi:
      "The primary objective of the Negotiable Instruments Act is to promote credibility of negotiable instruments. Criminal prosecution is a remedy to ensure prompt payment, and courts should explore compounding at every stage to resolve disputes amicably.",
    relatedSections: ["Section 138 NI Act", "Section 147 NI Act", "Section 258 CrPC"],
  },
  {
    id: 3,
    caseName: "Rangappa v. Sri Mohan",
    court: "Supreme Court of India",
    date: "2010-05-04",
    citation: "(2010) 11 SCC 441",
    summary:
      "This landmark judgment established the presumption under Section 118 and 139 of the NI Act. Once the payee proves that the cheque was issued by the drawer, the presumption operates that it was issued for discharge of debt or liability.",
    keyPrinciples: [
      "Section 118(a) presumption: every negotiable instrument is presumed to be made for consideration",
      "Section 139 presumption: cheque is issued for discharge of debt or liability",
      "The burden shifts to the drawer to rebut the presumption once payee proves issuance",
    ],
    ratioDecidendi:
      "Once the complainant establishes that the cheque was issued by the accused, the statutory presumptions under Sections 118 and 139 of the NI Act apply, and the burden shifts to the accused to prove that the cheque was not issued for discharge of any debt or liability.",
    relatedSections: ["Section 118 NI Act", "Section 139 NI Act", "Section 138 NI Act"],
  },
  {
    id: 4,
    caseName: "Bridgestone India Pvt. Ltd. v. Inderpal Singh",
    court: "Supreme Court of India",
    date: "2016-09-05",
    citation: "(2016) 8 SCC 47",
    summary:
      "The court clarified the interplay between Section 138 and civil suits, holding that a civil suit for recovery and a criminal complaint under Section 138 can proceed simultaneously. The stay of civil proceedings is not mandatory when criminal proceedings are pending.",
    keyPrinciples: [
      "Civil suit for recovery and criminal complaint under Section 138 can proceed simultaneously",
      "Stay of civil suit is not automatically warranted when criminal proceedings are pending",
      "Both remedies — civil and criminal — are independent of each other",
    ],
    ratioDecidendi:
      "The remedy available to the complainant under Section 138 of the NI Act is in addition to, and not in derogation of, the civil remedy. The pendency of one proceeding does not stay the other.",
    relatedSections: ["Section 138 NI Act", "Order 7 Rule 11 CPC", "Section 142 NI Act"],
  },
];

export default function DemoPage() {
  const [query, setQuery] = useState("");
  const [court, setCourt] = useState("All Courts");
  const [year, setYear] = useState("All Years");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

    if (apiKey) {
      try {
        const courtFilter = court !== "All Courts" ? ` from ${court}` : "";
        const yearFilter = year !== "All Years" ? ` decided in ${year}` : "";

        const systemPrompt = `You are an Indian legal research AI assistant. You have comprehensive knowledge of Indian case law from the Supreme Court and High Courts. When given a legal query, provide relevant judgments with accurate details. Always respond in valid JSON format.`;

        const userPrompt = `Research the following Indian case law query: "${query}"${courtFilter}${yearFilter}

Provide a JSON response with this exact structure (no markdown, just raw JSON):
{
  "results": [
    {
      "caseName": "Full case name with parties",
      "court": "Court name",
      "date": "YYYY-MM-DD format",
      "citation": "Standard citation (e.g., (2020) 1 SCC 123)",
      "summary": "Detailed 3-4 sentence summary of the case",
      "keyPrinciples": ["Principle 1", "Principle 2", "Principle 3"],
      "ratioDecidendi": "The ratio decidendi / core legal principle of the case",
      "relatedSections": ["Relevant Act/Section 1", "Relevant Act/Section 2"]
    }
  ]
}

Provide 3-5 relevant cases. Focus on the most cited and landmark judgments.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Indian Case Law Researcher",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 4000,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `API error: ${response.status} — ${errorBody.slice(0, 200)}`,
          );
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content ?? "";

        // Try to extract JSON from the response
        let parsed: { results?: CaseResult[] } | null = null;

        // Try direct parse first
        try {
          parsed = JSON.parse(content) as { results?: CaseResult[] };
        } catch {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]) as { results?: CaseResult[] };
          } else {
            // Try to find a JSON object in the text
            const objMatch = content.match(/\{[\s\S]*\}/);
            if (objMatch) {
              parsed = JSON.parse(objMatch[0]) as { results?: CaseResult[] };
            }
          }
        }

        if (parsed?.results && Array.isArray(parsed.results)) {
          setResults(
            parsed.results.map((r, i) => ({
              ...r,
              id: i + 1,
              keyPrinciples: r.keyPrinciples ?? [],
              relatedSections: r.relatedSections ?? [],
            })),
          );
        } else {
          throw new Error("Could not parse structured results from the API response.");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`API Error: ${message}. Falling back to demo results.`);
        // Fallback to demo results after a brief delay
        setTimeout(() => {
          setResults(DEMO_RESULTS);
          setError(null);
        }, 1500);
      } finally {
        setLoading(false);
      }
    } else {
      // Demo mode — simulate API delay and return sample results
      await new Promise((r) => setTimeout(r, 1500));

      const filtered = DEMO_RESULTS.filter((r) => {
        const courtMatch = court === "All Courts" || r.court === court;
        const yearMatch =
          year === "All Years" || r.date.startsWith(year);
        return courtMatch && yearMatch;
      });

      setResults(filtered.length > 0 ? filtered : DEMO_RESULTS);
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
          Case Law Research
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-navy-300">
          Search Supreme Court and High Court judgments. Enter a legal topic, statute
          reference, or case name.
        </p>
      </div>

      {/* Search Panel */}
      <div className="mx-auto max-w-4xl rounded-2xl border border-navy-700 bg-surface p-6 shadow-xl sm:p-8">
        {/* Query Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder='e.g. "Section 138 NI Act", "Article 21 privacy"...'
            className="w-full rounded-xl border border-navy-600 bg-navy-900 py-4 pl-12 pr-4 text-white placeholder-navy-500 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <Landmark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
            <select
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="w-full appearance-none rounded-lg border border-navy-600 bg-navy-900 py-3 pl-10 pr-8 text-sm text-navy-200 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {COURTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full appearance-none rounded-lg border border-navy-600 bg-navy-900 py-3 pl-10 pr-8 text-sm text-navy-200 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-base font-semibold text-navy-950 shadow-md shadow-accent/20 transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Scale className="h-5 w-5" />
              Research
            </>
          )}
        </button>

        {/* Demo mode notice */}
        {!import.meta.env.VITE_OPENROUTER_API_KEY && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-navy-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Running in demo mode — set{" "}
            <code className="rounded bg-navy-800 px-1.5 py-0.5 font-mono text-accent">
              VITE_OPENROUTER_API_KEY
            </code>{" "}
            for live AI responses
          </div>
        )}
      </div>

      {/* Quick Queries */}
      {!searched && (
        <div className="mx-auto mt-8 max-w-4xl">
          <p className="mb-3 text-center text-sm text-navy-400">Try a sample query:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_QUERIES.map((sq) => (
              <button
                key={sq}
                onClick={() => {
                  setQuery(sq);
                  // Auto-trigger search
                  setTimeout(() => {
                    setQuery(sq);
                    // Trigger search via synthetic event
                    const event = new KeyboardEvent("keydown", { key: "Enter" });
                    document.querySelector("input[type=text]")?.dispatchEvent(event);
                  }, 100);
                }}
                className="rounded-full border border-navy-700 bg-navy-900/50 px-4 py-1.5 text-xs text-navy-300 transition hover:border-accent/50 hover:text-accent"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-auto mt-6 max-w-4xl rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mx-auto mt-10 max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
              {results.length} Result{results.length !== 1 ? "s" : ""} Found
            </h2>
            <span className="text-xs text-navy-500">
              {court !== "All Courts" ? court : "All Courts"} · {year !== "All Years" ? year : "2020–2026"}
            </span>
          </div>

          <div className="space-y-6">
            {results.map((c) => (
              <CaseCard key={c.id} result={c} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state after search */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="mx-auto mt-12 max-w-4xl text-center">
          <BookOpen className="mx-auto h-12 w-12 text-navy-600" />
          <p className="mt-4 text-lg text-navy-400">
            No results found for your query. Try a different search term or adjust the filters.
          </p>
        </div>
      )}
    </main>
  );
}

function CaseCard({ result }: { result: CaseResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-navy-700 bg-surface/70 p-5 transition hover:border-navy-600 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
            {result.caseName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-navy-400">
            <span className="flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5" /> {result.court}
            </span>
            <span>{result.date}</span>
            <span className="rounded bg-navy-800 px-2 py-0.5 font-mono text-xs text-accent">
              {result.citation}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-accent transition hover:text-accent-light"
        >
          {expanded ? "Less" : "Details"}
          <ChevronRight
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      {/* Summary */}
      <p className="mt-4 text-sm leading-relaxed text-navy-300">{result.summary}</p>

      {/* Key Principles (always visible) */}
      <div className="mt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
          Key Principles
        </h4>
        <ul className="space-y-1.5">
          {result.keyPrinciples.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-navy-200"
            >
              <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-5 space-y-4 border-t border-navy-800 pt-5">
          {/* Ratio Decidendi */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-navy-500">
              <FileText className="h-3.5 w-3.5" />
              Ratio Decidendi
            </h4>
            <p className="rounded-lg bg-navy-900/60 p-4 text-sm leading-relaxed text-navy-200 italic">
              &ldquo;{result.ratioDecidendi}&rdquo;
            </p>
          </div>

          {/* Related Sections */}
          {result.relatedSections.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
                Related Sections
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.relatedSections.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-navy-700 bg-navy-900/60 px-3 py-1 text-xs text-navy-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
