import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ErrorBoundary from "../components/ErrorBoundary";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LoadingOverlay from "../components/LoadingOverlay";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeVideo } from "../api/truthguard";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";

const pipelineSteps = [
  { id: "frames", label: "Frame Extraction", icon: "📷" },
  { id: "deepfake", label: "Deepfake Detection", icon: "🔍" },
  { id: "audio", label: "Audio Analysis", icon: "🎙️" },
];

function VideoAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!isLoading) return undefined;
    setCurrentStage(0);
    const timers = [
      setTimeout(() => setCurrentStage(1), 1400),
      setTimeout(() => setCurrentStage(2), 2800),
    ];
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [isLoading]);

  const onAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a video file first.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await analyzeVideo(selectedFile);
      const normalized = normalizeAnalysisResults(response);
      setResults(normalized);
      setTimeout(
        () =>
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100
      );

      saveAnalysisToSession({
        id: `${Date.now()}-video`,
        time: new Date().toISOString(),
        modality: "video",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: normalized.language,
        results: normalized,
      });
      toast.success("Video analysis completed.");
    } catch (err) {
      const message = err?.message || "Unable to analyze this video right now.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verdictStyle = useMemo(
    () => getVerdictPresentation(results?.verdict),
    [results?.verdict]
  );

  const handleShareResults = async () => {
    if (!results) return;
    const summary = `TruthGuard Analysis Result
Modality: video
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
    setError(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <section className="trust-card p-6">
        <h2 className="text-2xl font-semibold text-gray-900">🎬 Video Analysis</h2>
        <p className="mt-1 text-sm text-gray-600">
          Detect deepfake videos by analyzing frames and audio track.
        </p>

        <div className="mt-5">
          <FileUpload
            accept="video/mp4,video/quicktime,video/avi,video/x-msvideo"
            maxSizeMB={100}
            onFileSelected={setSelectedFile}
            label="Upload Video"
            icon="🎬"
          />
        </div>

        {previewUrl && (
          <div className="mt-4">
            <video
              src={previewUrl}
              controls
              muted
              className="max-h-48 w-full rounded-xl border border-gray-200 bg-black"
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
          {[
            { icon: "📷", label: "Frame Extraction" },
            { icon: "🔍", label: "Deepfake Detection" },
            { icon: "🎙️", label: "Audio Analysis" },
          ].map((step, idx) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {step.icon} {step.label}
              </div>
              {idx < 2 && <span className="hidden text-gray-300 sm:block">→</span>}
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          ⏱️ Video analysis processes up to 10 frames + audio track. Large files
          may take 2–3 minutes.
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !selectedFile}
          className="btn-primary mt-5"
        >
          {isLoading ? "Analyzing..." : "Analyze Video →"}
        </button>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
      </section>

      <section className="trust-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          How It Works
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm sm:gap-4">
          {pipelineSteps.map((step, index) => {
            const isActive = isLoading && currentStage === index;
            const isCompleted = isLoading && currentStage > index;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                      : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {step.icon} {step.label}
                </div>
                {index < pipelineSteps.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </div>
            );
          })}
        </div>
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
                    modality="video"
                  />

                  {results?.detection?.audio?.transcript && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900">
                        📝 Extracted Transcript
                      </h3>
                      <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                        {results.detection.audio.transcript}
                      </p>
                    </div>
                  )}
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

export default VideoAnalysis;
