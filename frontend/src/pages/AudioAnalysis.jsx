import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ErrorBoundary from "../components/ErrorBoundary";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LoadingOverlay from "../components/LoadingOverlay";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeAudio } from "../api/truthguard";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";

function AudioAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  const verdictStyle = useMemo(
    () => getVerdictPresentation(results?.verdict),
    [results?.verdict]
  );

  const onAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please upload an audio file first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeAudio(selectedFile);
      const normalized = normalizeAnalysisResults(payload);
      setResults(normalized);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
      saveAnalysisToSession({
        id: `${Date.now()}-audio`,
        time: new Date().toISOString(),
        modality: "audio",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: normalized.language,
        results: normalized,
      });
      toast.success("Audio analysis completed.");
    } catch (err) {
      const message = err?.message || "Unable to analyze audio right now.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareResults = async () => {
    if (!results) return;
    const summary = `TruthGuard Analysis Result
Modality: audio
Trust Score: ${results?.trust_score ?? 0}/100
Verdict: ${results?.verdict ?? "SUSPICIOUS"}`;
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Copied!");
    } catch (err) {
      toast.error("Unable to copy.");
    }
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <section className="trust-card p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          🎙️ Audio Deepfake Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload voice clips to transcribe content and detect synthetic audio
          artifacts.
        </p>

        <div className="mt-5">
          <FileUpload
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/webm"
            maxSizeMB={50}
            onFileSelected={setSelectedFile}
            label="Upload Audio"
            icon="🎙️"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
            <div className="text-2xl">🗣️</div>
            <p className="mt-2 text-xs font-semibold text-gray-700">
              Voice Clone Detection
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Detects AI-synthesized voices using wav2vec2
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
            <div className="text-2xl">📝</div>
            <p className="mt-2 text-xs font-semibold text-gray-700">
              Auto Transcription
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Whisper AI transcribes Hindi, Telugu &amp; English audio
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
            <div className="text-2xl">🔍</div>
            <p className="mt-2 text-xs font-semibold text-gray-700">Fact-Check</p>
            <p className="mt-1 text-xs text-gray-500">
              Transcribed text is verified against fact databases
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          ⏱️ Whisper transcription may take 30–60 seconds on first run as the model
          downloads.
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !selectedFile}
          className="btn-primary mt-5"
        >
          {isLoading ? "Analyzing..." : "Analyze Audio →"}
        </button>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </section>

      {(results || isLoading) && (
        <section ref={resultsRef} className="space-y-4">
          {results && (
            <div className="mt-2 flex flex-wrap gap-3">
              <button onClick={handleShareResults} className="btn-secondary" type="button">
                📋 Copy Summary
              </button>
              <button onClick={handleNewAnalysis} className="btn-secondary" type="button">
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
                    modality="audio"
                  />
                </div>
                <div className="space-y-6 xl:col-span-3">
                  <ExplanationPanel
                    countermeasure={results?.countermeasure}
                    language={results?.language ?? "en"}
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

export default AudioAnalysis;
