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
      toast.success("Text file loaded.");
    } catch (err) {
      toast.error("Unable to read text file.");
    }
  };

  const onAnalyze = async () => {
    if (!activeText) {
      toast.error("Please enter or upload text to analyze.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeText(activeText, selectedLanguage);
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
      toast.success("Text analysis completed.");
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
      toast.success("Analysis summary copied to clipboard!");
    } catch (err) {
      toast.error("Unable to copy summary.");
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
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error("Unable to copy share link.");
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
    toast.success("Downloading analysis report...");
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
          📝 Text Misinformation Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Paste claims or upload text files for fake-news, AI-generated-text, and
          fact-verification checks.
        </p>

        <div className="mt-4">
          <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
        </div>

        <div className="mt-4">
          <label
            htmlFor="claim-input"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Claim or Content
          </label>
          <textarea
            id="claim-input"
            rows={8}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text to analyze..."
            className="w-full rounded-xl border-gray-300 focus:border-truthguard-blue focus:ring-truthguard-blue"
          />
          <p className="mt-2 text-right text-xs text-gray-400">
            {textInput.length} characters · {wordCount} words
          </p>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500">Try a sample:</p>
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
              🇮🇳 Telugu Alert
            </button>
          </div>
        </div>

        <div className="mt-4">
          <FileUpload
            accept=".txt,.md,text/plain"
            maxSizeMB={10}
            onFileSelected={onTextFileSelected}
            label="Upload Text File (Optional)"
            icon="📄"
          />
        </div>

        {textFile && (
          <p className="mt-2 text-xs text-gray-500">
            Loaded from file: <span className="font-medium">{textFile.name}</span>
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !activeText}
          className="btn-primary mt-5"
        >
          {isLoading ? "Analyzing..." : "Analyze Text →"}
        </button>
        {(textInput || results) && (
          <button type="button" onClick={onNewAnalysis} className="btn-secondary ml-3 mt-5">
            Clear
          </button>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </section>

      {(results || isLoading) && (
        <section ref={resultsRef} className="space-y-4">
          {results && (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onCopySummary} className="btn-secondary">
                📋 Copy Summary
              </button>
              <button type="button" onClick={onShareLink} className="btn-secondary">
                🔗 Share Link
              </button>
              <button type="button" onClick={onDownloadReport} className="btn-secondary">
                ⬇️ Download Report
              </button>
              <button type="button" onClick={onNewAnalysis} className="btn-secondary">
                ↩ New Analysis
              </button>
            </div>
          )}

          <div className="relative">
            <LoadingOverlay isLoading={isLoading} />
            <ErrorBoundary>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <div className="space-y-6 xl:col-span-2">
                  <TrustScoreGauge
                    score={results?.trust_score ?? 0}
                    verdict={results?.verdict ?? "SUSPICIOUS"}
                    verdictColor={verdictStyle.color}
                    verdictEmoji={verdictStyle.emoji}
                    flags={results?.flags ?? []}
                    isLoading={isLoading}
                  />
                  <DetectionResults
                    detection={results?.detection ?? {}}
                    modality="text"
                  />
                  <SuspiciousSentences
                    sentences={results?.detection?.suspicious_sentences ?? []}
                    isLoading={isLoading}
                  />
                </div>
                <div className="space-y-6 xl:col-span-3">
                  <ExplanationPanel
                    countermeasure={results?.countermeasure}
                    language={results?.language ?? selectedLanguage}
                    isLoading={isLoading}
                  />
                  <AlternativeSources
                    sources={results?.alternative_sources ?? []}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </ErrorBoundary>
          </div>
        </section>
      )}
    </div>
  );
}

export default TextAnalysis;
