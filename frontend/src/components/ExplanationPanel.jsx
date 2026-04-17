function formatExplanationSections(explanation = "") {
  const trimmed = explanation.trim();
  if (!trimmed) return [];

  const sections = trimmed
    .split(/(?=\n?\s*\d+\.\s)/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sections.length <= 1) {
    return [{ heading: "Overview", body: trimmed }];
  }

  return sections.map((entry) => {
    const matched = entry.match(/^(\d+\.\s*)([^\n:]+)(:?)([\s\S]*)$/);
    if (!matched) {
      return { heading: "Context", body: entry };
    }

    const headingText = matched[2].trim();
    const bodyText = matched[4].trim() || entry.replace(matched[1], "").trim();
    const normalized = headingText.toUpperCase();

    if (normalized.startsWith("WHY")) {
      return { heading: "Why This Matters", body: bodyText };
    }
    if (normalized.startsWith("WHAT")) {
      return { heading: headingText, body: bodyText };
    }

    return { heading: headingText, body: bodyText };
  });
}

function languageLabel(code = "en") {
  const map = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
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
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl bg-blue-50 p-4">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-11/12 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-3 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  if (!hasData) {
    return (
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="border-l-4 border-blue-500 pl-3">
          <h2 className="text-lg font-semibold text-gray-900">
            🧠 AI Explanation & Context
          </h2>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-700">Analysis in progress...</p>
          <p className="mt-1 text-sm text-gray-500">
            The model explanation will appear once detection finishes.
          </p>
        </div>
      </section>
    );
  }

  const explanationSections = formatExplanationSections(countermeasure.explanation);
  const usedLanguage = countermeasure.language_used || language;
  const provider = (countermeasure.llm_provider || "Gemini").toLowerCase();
  const providerName = provider.includes("groq") ? "Groq" : "Gemini";

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="border-l-4 border-blue-500 pl-3">
          <h2 className="text-lg font-semibold text-gray-900">
            🧠 AI Explanation & Context
          </h2>
        </div>
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Powered by {providerName}
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Why This Content Raises Concerns
            </h3>
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {languageLabel(usedLanguage)}
            </span>
          </div>
          <div className="space-y-4 rounded-xl bg-blue-50 p-4">
            {explanationSections.map((section, index) => (
              <div key={`${section.heading}-${index}`}>
                <h4 className="text-sm font-semibold text-blue-800">{section.heading}</h4>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-blue-900">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            💡 Media Literacy Tip
          </h3>
          <div className="mt-2 rounded-xl bg-amber-50 p-4">
            <p className="text-sm leading-relaxed text-amber-900">
              💡 {countermeasure.media_literacy_tip || "Cross-check with verified sources before sharing."}
            </p>
          </div>
        </div>

        {usedLanguage !== "en" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Explanation generated in {languageLabel(usedLanguage)} to match your
            content.
          </div>
        )}
      </div>
    </section>
  );
}

export default ExplanationPanel;
