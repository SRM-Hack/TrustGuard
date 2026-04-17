import { useMemo, useState } from "react";

function getInitials(source = "NA") {
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "NA";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function colorForSource(name = "") {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % colors.length;
  }
  return colors[hash];
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function SourceCard({ item }) {
  const sourceName = item.source || "Unknown Source";
  const badgeColor = useMemo(() => colorForSource(sourceName), [sourceName]);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeColor}`}
        >
          {getInitials(sourceName)}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-2 text-base font-semibold text-gray-900 hover:text-blue-700"
          >
            {item.title || "Untitled Source"}
          </a>
          <p className="mt-1 text-xs text-gray-500">
            {sourceName} • {formatDate(item.published_at)}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {item.description || "No summary available for this source."}
          </p>
          <div className="mt-3 text-right">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Read More →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function AlternativeSources({ sources = [], isLoading = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSources = isExpanded ? sources : sources.slice(0, 3);
  const hiddenCount = Math.max(0, sources.length - 3);

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          📰 Verified Alternative Sources
        </h2>
        <p className="text-sm text-gray-500">Credible coverage of this topic</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <div className="mx-auto mb-2 w-fit rounded-full bg-gray-100 p-3 text-2xl">
            👻
          </div>
          <p className="font-medium text-gray-700">No alternative sources found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try refining your claim for broader credible coverage.
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
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              Show {hiddenCount} more sources
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default AlternativeSources;
