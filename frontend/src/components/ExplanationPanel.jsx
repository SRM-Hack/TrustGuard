function formatExplanationSections(explanation = "") {
  const trimmed = explanation.trim();
  if (!trimmed) return [];

  const sections = trimmed
    .split(/(?=\n?\s*\d+\.\s)/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sections.length <= 1) {
    return [{ heading: "Analysis Overview", body: trimmed }];
  }

  return sections.map((entry) => {
    const matched = entry.match(/^(\d+\.\s*)([^\n:]+)(:?)([\s\S]*)$/);
    if (!matched) {
      return { heading: "Key Context", body: entry };
    }

    const headingText = matched[2].trim();
    const bodyText = matched[4].trim() || entry.replace(matched[1], "").trim();
    const normalized = headingText.toUpperCase();

    if (normalized.startsWith("WHY")) {
      return { heading: "Why This Is Suspicious", body: bodyText, color: "text-orange-600" };
    }
    return { heading: headingText, body: bodyText, color: "text-blue-700" };
  });
}

function languageLabel(code = "en") {
  const map = {
    en: "English",
    hi: "हिन्दी",
    te: "తెలుగు",
    auto: "Auto-detected",
  };
  return map[code] || code;
}

function ExplanationPanel({ countermeasure, language = "en", isLoading = false }) {
  const hasData =
    countermeasure &&
    (countermeasure.explanation ||
      countermeasure.media_literacy_tip ||
      countermeasure.language_used);

  if (isLoading) {
    return (
      <section className="trust-card space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-100 skeleton-shimmer" />
            <div className="h-6 w-48 skeleton-shimmer rounded" />
          </div>
          <div className="h-6 w-24 skeleton-shimmer rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-[90%] skeleton-shimmer rounded" />
          <div className="h-4 w-[75%] skeleton-shimmer rounded" />
          <div className="h-4 w-[85%] skeleton-shimmer rounded" />
          <div className="h-4 w-[60%] skeleton-shimmer rounded" />
        </div>
      </section>
    );
  }

  if (!hasData) {
    return (
      <section className="trust-card">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200/20">
            <span className="text-lg">🧠</span>
          </div>
          <h2 className="font-display font-bold text-lg text-gray-900">
            AI Explanation & Context
          </h2>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center py-8 px-4 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50">
          <div className="text-3xl mb-3 animate-bounce">⏳</div>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Analysis in progress</p>
          <p className="mt-1 text-xs text-gray-500">Insights will appear here shortly...</p>
        </div>
      </section>
    );
  }

  const explanationSections = formatExplanationSections(countermeasure.explanation);
  const usedLanguage = countermeasure.language_used || language;
  const provider = (countermeasure.llm_provider || "Gemini").toLowerCase();
  const isGroq = provider.includes("groq");

  return (
    <section className="trust-card relative space-y-6 animate-fade-in-up">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-lg text-gray-900 tracking-tight">
            AI Explanation & Context
          </h2>
        </div>

        {/* LLM Provider Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm transition-all duration-300 ${
          isGroq 
            ? "bg-purple-600/10 border-purple-200 text-purple-700 shadow-purple-100" 
            : "bg-blue-600/10 border-blue-200 text-blue-700 shadow-blue-100"
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider">
            {isGroq ? "⚡ Groq" : "✦ Gemini"}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1 — Explanation */}
        <div className="relative glass-blue border border-blue-200/40 rounded-2xl p-5 space-y-5 overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="badge-blue !bg-white/80 !border-blue-100 text-[10px] font-bold uppercase">
              {languageLabel(usedLanguage)}
            </span>
          </div>
          
          <div className="space-y-6">
            {explanationSections.map((section, index) => (
              <div key={`${section.heading}-${index}`} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${section.color || "text-blue-700"}`}>
                  {section.heading}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — Media Literacy Tip */}
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 border-l-[6px] border-l-amber-400 flex gap-4 animate-fade-in-up shadow-sm">
          <div className="text-2xl pt-0.5">💡</div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest">
              Media Literacy Tip
            </h3>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              {countermeasure.media_literacy_tip || "Always cross-check information with at least two independent verified sources before sharing content online."}
            </p>
          </div>
        </div>

        {/* Section 3 — Language note */}
        {usedLanguage !== "en" && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 animate-fade-in">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] font-medium italic">
              Explanation generated in {languageLabel(usedLanguage)} to match the detected content language.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default ExplanationPanel;
