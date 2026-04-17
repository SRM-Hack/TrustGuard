import { useMemo, useState } from "react";

function getInitials(source = "NA") {
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "NA";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function colorForSource(name = "") {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-red-600",
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-lime-500 to-green-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % gradients.length;
  }
  return gradients[hash];
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SourceCard({ item }) {
  const sourceName = item.source || "Unknown Source";
  const gradient = useMemo(() => colorForSource(sourceName), [sourceName]);

  return (
    <article className="trust-card-hover group !p-4">
      <div className="flex items-start gap-4">
        {/* Source Avatar */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white text-xs font-black bg-gradient-to-br ${gradient} shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
          {getInitials(sourceName)}
        </div>
        
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug"
            >
              {item.title || "Untitled Coverage"}
            </a>
            <div className="flex items-center gap-2">
              <span className="badge-blue !px-2 !py-0.5 text-[10px] font-bold uppercase">
                {sourceName}
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                {formatDate(item.published_at)}
              </span>
            </div>
          </div>
          
          <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed">
            {item.description || "Comprehensive coverage and verified reporting on this topic from credible sources."}
          </p>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
          aria-label="Read full source"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </article>
  );
}

function AlternativeSources({ sources = [], isLoading = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSources = isExpanded ? sources : sources.slice(0, 3);
  const hiddenCount = Math.max(0, sources.length - 3);

  return (
    <section className="trust-card space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-200/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-gray-900 tracking-tight">
            Verified Alternative Sources
          </h2>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-0.5">
            Credible coverage of this topic
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="h-11 w-11 rounded-full bg-gray-100 skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 bg-gray-100 rounded skeleton-shimmer" />
                <div className="h-3 w-1/4 bg-gray-100 rounded skeleton-shimmer" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full bg-gray-100 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-5/6 bg-gray-100 rounded skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-10 text-center animate-fade-in">
          <div className="text-5xl mb-4 grayscale opacity-50">📰</div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">No alternative sources found</h3>
          <p className="mt-2 text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
            Try refining your search term or check the content directly through a trusted fact-checking portal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSources.map((item, index) => (
            <SourceCard
              key={`${item.url || item.title || "source"}-${index}`}
              item={item}
            />
          ))}

          {hiddenCount > 0 && !isExpanded && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="btn-secondary w-full group"
              >
                Show <span className="text-blue-600 font-bold mx-1">{hiddenCount}</span> more sources
                <span className="ml-2 group-hover:translate-y-0.5 transition-transform inline-block">↓</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AlternativeSources;
