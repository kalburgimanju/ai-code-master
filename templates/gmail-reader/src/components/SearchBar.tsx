import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  currentQuery: string;
}

const QUICK_FILTERS = [
  { label: "Unread", query: "is:unread" },
  { label: "Starred", query: "is:starred" },
  { label: "Last 7 days", query: "newer_than:7d" },
  { label: "Has attachment", query: "has:attachment" },
];

export default function SearchBar({ onSearch, currentQuery }: SearchBarProps) {
  const [query, setQuery] = useState(currentQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleQuickFilter = (filterQuery: string) => {
    setQuery(filterQuery);
    onSearch(filterQuery);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search emails... (e.g., "from:john subject:meeting")'
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gmail-500/20 focus:border-gmail-400 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onSearch("in:inbox");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <div className="flex gap-2 flex-wrap">
        {QUICK_FILTERS.map(({ label, query: filterQuery }) => (
          <button
            key={label}
            onClick={() => handleQuickFilter(filterQuery)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
              currentQuery === filterQuery
                ? "bg-gmail-500 text-white border-gmail-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gmail-300 hover:text-gmail-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
