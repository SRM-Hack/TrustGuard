import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ErrorBoundary from "../components/ErrorBoundary";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LanguageSelector from "../components/LanguageSelector";
import LoadingOverlay from "../components/LoadingOverlay";
import SuspiciousSentences from "../components/SuspiciousSentences";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeText } from "../api/truthguard";
import { SAMPLE_TEXTS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import { analysisTranslations } from "../locales/translations";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";
import { downloadReport, generateShareLink, generateSummary } from "../utils/reportGenerator";

async function readTextFile(file) {
  return file.text();
}

function TextAnalysis() {
  const { t, language } = useLanguage();
  const [textInput, setTextInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [textFile, setTextFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  const activeText = textInput.trim();
  const verdictStyle = useMemo(
    () => getVerdictPresentation(results?.verdict),
    [results?.verdict]
  );

  const onTextFileSelected = async (file) => {
    setTextFile(file);
    if (!file) return;
    try {
      const content = await readTextFile(file);
      setTextInput(content);
      toast.success(t("fileLoaded", analysisTranslations) || "Text file loaded.");
    } catch (err) {
      toast.error(t("fileReadError", analysisTranslations) || "Unable to read text file.");
    }
  };

  const onAnalyze = async () => {
    if (!activeText) {
      toast.error(t("enterTextError", analysisTranslations) || "Please enter or upload text to analyze.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeText(activeText, selectedLanguage === "auto" ? language : selectedLanguage);
      const normalized = normalizeAnalysisResults(payload);
      setResults(normalized);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
      saveAnalysisToSession({
        id: `${Date.now()}-text`,
        time: new Date().toISOString(),
        modality: "text",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: normalized.language,
        results: normalized,
      });
      toast.success(t("analysisSuccess", analysisTranslations) || "Text analysis completed.");
    } catch (err) {
      const message = err?.message || "Unable to analyze text right now.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onCopySummary = async () => {
    if (!results) return;
    const summary = generateSummary({
      modality: "text",
      score: results.trust_score,
      verdict: results.verdict,
      emoji: verdictStyle.emoji,
      language: results.language || selectedLanguage,
      flags: results.flags,
    });

    try {
      await navigator.clipboard.writeText(summary);
      toast.success(t("summaryCopied", analysisTranslations) || "Analysis summary copied to clipboard!");
    } catch (err) {
      toast.error(t("copyError", analysisTranslations) || "Unable to copy summary.");
    }
  };

  const onShareLink = async () => {
    if (!results) return;
    const shareUrl = generateShareLink({
      modality: "text",
      score: results.trust_score,
      verdict: results.verdict,
      language: results.language || selectedLanguage,
      flags: results.flags,
    });

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("linkCopied", analysisTranslations) || "Share link copied to clipboard!");
    } catch (err) {
      toast.error(t("copyError", analysisTranslations) || "Unable to copy share link.");
    }
  };

  const onDownloadReport = () => {
    if (!results) return;
    downloadReport({
      modality: "text",
      score: results.trust_score,
      verdict: results.verdict,
      emoji: verdictStyle.emoji,
      language: results.language || selectedLanguage,
      flags: results.flags,
      explanation: results.countermeasure?.explanation,
      sources: results.alternative_sources,
    });
    toast.success(t("downloadingReport", analysisTranslations) || "Downloading analysis report...");
  };

  const onNewAnalysis = () => {
    setResults(null);
    setTextInput("");
    setError("");
    setTextFile(null);
  };

  const wordCount = textInput.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <section className="trust-card p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          📝 {t("textTitle", analysisTranslations)}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("textSub", analysisTranslations)}
        </p>

        <div className="mt-4">
          <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
        </div>

        <div className="mt-4">
          <label
            htmlFor="claim-input"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t("claimInputLabel", analysisTranslations)}
          </label>
          <textarea
            id="claim-input"
            rows={8}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t("placeholderText", analysisTranslations)}
            className="w-full rounded-xl border-gray-300 focus:border-truthguard-blue focus:ring-truthguard-blue"
          />
          <p className="mt-2 text-right text-xs text-gray-400">
            {textInput.length} {t("characters", analysisTranslations)} · {wordCount} {t("words", analysisTranslations)}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500">{t("sampleText", analysisTranslations)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTextInput(SAMPLE_TEXTS.en)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              🇬🇧 English Fake News
            </button>
            <button
              type="button"
              onClick={() => setTextInput(SAMPLE_TEXTS.hi)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              🇮🇳 Hindi WhatsApp Forward
            </button>
            <button
              type="button"
              onClick={() => setTextInput(SAMPLE_TEXTS.te)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              🇮🇳 Telugu Misinformation
            </button>
          </div>
        </div>

        <div className="mt-6">
          <FileUpload
            accept=".txt,.doc,.docx,.pdf"
            onFileSelect={onTextFileSelected}
            selectedFile={textFile}
          />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {results && (
            <button
              type="button"
              onClick={onNewAnalysis}
              className="btn-secondary"
            >
              {t("newAnalysis", analysisTranslations)}
            </button>
          )}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading || !activeText}
            className="btn-primary min-w-[160px]"
          >
            {isLoading ? t("analyzingBtn", analysisTranslations) : t("analyzeBtn", analysisTranslations)}
          </button>
        </div>
      </section>

      {results && (
        <div ref={resultsRef} className="animate-fade-in-up space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TrustScoreGauge score={results.trust_score} verdict={results.verdict} />
            </div>
            <div className="lg:col-span-2">
              <DetectionResults 
                verdict={results.verdict} 
                flags={results.flags}
                onDownload={onDownloadReport}
                onShare={onShareLink}
                onCopy={onCopySummary}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ExplanationPanel 
              explanation={results.countermeasure?.explanation} 
              recommendation={results.countermeasure?.recommendation}
            />
            <AlternativeSources sources={results.alternative_sources} />
          </div>

          {results.suspicious_sentences?.length > 0 && (
            <SuspiciousSentences sentences={results.suspicious_sentences} />
          )}
        </div>
      )}

      {isLoading && <LoadingOverlay message="Analyzing text content..." />}
    </div>
  );
}

export default function TextAnalysisPage() {
  return (
    <ErrorBoundary>
      <TextAnalysis />
    </ErrorBoundary>
  );
}
