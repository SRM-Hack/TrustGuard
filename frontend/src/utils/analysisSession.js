export const HISTORY_KEY = "truthguard_analysis_history";

export function saveAnalysisToSession(entry) {
  const existing = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
  const updated = [entry, ...existing].slice(0, 10);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function formatModality(modality = "text") {
  const map = {
    text: "Text Analysis",
    image: "Image Analysis",
    audio: "Audio Analysis",
    video: "Video Analysis",
  };
  return map[modality] || "Content Analysis";
}

export function normalizeAnalysisResults(payload = {}) {
  return {
    trust_score: payload.trust_score ?? payload.score ?? 0,
    verdict: payload.verdict ?? "SUSPICIOUS",
    detection: payload.detection ?? payload.modules ?? payload,
    countermeasure: payload.countermeasure ?? {},
    alternative_sources:
      payload.alternative_sources ?? payload.countermeasure?.alternative_sources ?? [],
    language: payload.language ?? payload.countermeasure?.language_used ?? "en",
    flags:
      payload.flags ??
      payload.detection?.flags ??
      payload.modules?.flags ??
      [],
  };
}

export function getVerdictPresentation(verdict = "SUSPICIOUS") {
  if (verdict === "TRUSTED") {
    return { emoji: "✅", color: "#16A34A" };
  }
  if (verdict === "MISINFORMATION") {
    return { emoji: "🚫", color: "#DC2626" };
  }
  return { emoji: "⚠️", color: "#D97706" };
}
