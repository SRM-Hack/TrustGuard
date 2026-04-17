import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ErrorBoundary from "../components/ErrorBoundary";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LoadingOverlay from "../components/LoadingOverlay";
import TrustScoreGauge from "../components/TrustScoreGauge";
import VideoPipeline from "../components/VideoPipeline";
import { analyzeVideo } from "../api/truthguard";
import { useLanguage } from "../context/LanguageContext";
import { analysisTranslations } from "../locales/translations";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";
import { downloadReport, generateShareLink, generateSummary } from "../utils/reportGenerator";

const LOADING_STAGES = [
  "Extracting key frames for visual analysis...",
  "Running deepfake detection on extracted frames...",
  "Analyzing audio track for voice manipulation...",
  "Calculating final multi-modal trust score...",
];

function VideoAnalysis() {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStageIdx(0);
      interval = setInterval(() => {
        setLoadingStageIdx((prev) => (prev + 1) % LOADING_STAGES.length);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const verdictStyle = useMemo(
    () => getVerdictPresentation(results?.verdict),
    [results?.verdict]
  );

  const onAnalyze = async () => {
    if (!selectedFile) {
      toast.error(t("uploadVideoError", analysisTranslations) || "Please select a video file first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeVideo(selectedFile);
      const normalized = normalizeAnalysisResults(payload);
      setResults(normalized);

      saveAnalysisToSession({
        id: `${Date.now()}-video`,
        time: new Date().toISOString(),
        modality: "video",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: normalized.language || language,
        results: normalized,
      });

      toast.success(t("analysisSuccess", analysisTranslations) || "Video analysis completed.");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const message = err?.message || "Unable to analyze video right now.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onCopySummary = async () => {
    if (!results) return;
    const summary = generateSummary({
      modality: "video",
      score: results.trust_score,
      verdict: results.verdict,
      emoji: verdictStyle.emoji,
      language: results.language || language,
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
      modality: "video",
      score: results.trust_score,
      verdict: results.verdict,
      language: results.language || language,
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
      modality: "video",
      score: results.trust_score,
      verdict: results.verdict,
      emoji: verdictStyle.emoji,
      language: results.language || language,
      flags: results.flags,
      explanation: results.countermeasure?.explanation,
      sources: results.alternative_sources,
    });
    toast.success(t("downloadingReport", analysisTranslations) || "Downloading analysis report...");
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setSelectedFile(null);
    setError("");
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* HEADER SECTION */}
      <section className="trust-card p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <span className="text-8xl">🎬</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
              {t("videoTitle", analysisTranslations)}
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
              {t("videoSub", analysisTranslations)}
            </p>
          </div>

          <div className="glass-blue !bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex items-start gap-4 animate-fade-in-up">
            <div className="text-orange-600 text-xl pt-0.5">⏱️</div>
            <p className="text-sm text-orange-800 font-medium leading-relaxed">
              Video processing analyzes up to <span className="font-bold">10 frames + the full audio track</span>. Large files may take 2–3 minutes to complete.
            </p>
          </div>

          {/* UPLOAD AREA */}
          <div className="grid gap-8 lg:grid-cols-2 pt-4">
            <div className="space-y-6">
              <FileUpload
                accept="video/mp4,video/quicktime,video/avi"
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isLoading || !selectedFile}
                  className="btn-primary flex-1 h-12 text-base group"
                >
                  {isLoading ? t("analyzingBtn", analysisTranslations) : t("analyzeBtn", analysisTranslations)}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                {results && !isLoading && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={onCopySummary} className="btn-secondary h-12 px-6">
                      📋 {t("copySummary", analysisTranslations)}
                    </button>
                    <button onClick={onShareLink} className="btn-secondary h-12 px-6">
                      🔗 {t("shareLink", analysisTranslations)}
                    </button>
                    <button onClick={onDownloadReport} className="btn-secondary h-12 px-6">
                      ⬇️ {t("downloadReport", analysisTranslations)}
                    </button>
                    <button onClick={handleNewAnalysis} className="btn-secondary h-12 px-6 text-red-600 hover:text-red-700">
                      {t("newAnalysis", analysisTranslations)}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="relative">
              {previewUrl ? (
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-up border-4 border-white bg-black aspect-video flex items-center justify-center">
                  <video
                    src={previewUrl}
                    controls
                    muted
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-full min-h-[240px] rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <span className="text-5xl grayscale opacity-30">🎬</span>
                  <p className="text-xs font-bold uppercase tracking-widest">No Video Selected</p>
                </div>
              )}
            </div>
          </div>

          <VideoPipeline activeStage={loadingStageIdx} isComplete={!!results} />
        </div>
      </section>

      {/* RESULTS SECTION */}
      {(results || isLoading) && (
        <section ref={resultsRef} className="relative pt-4">
          <LoadingOverlay isLoading={isLoading} messages={LOADING_STAGES} />
          
          <ErrorBoundary>
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-5 animate-fade-in-up">
              {/* LEFT COLUMN */}
              <div className="space-y-8 xl:col-span-2">
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

                {results?.detection?.video?.audio_analysis?.transcript && (
                  <div className="trust-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        <h3 className="font-display font-bold text-gray-900">Extracted Audio Transcript</h3>
                      </div>
                      <span className="badge-blue !text-[10px] uppercase font-black">
                        {results?.language?.toUpperCase() || "EN"}
                      </span>
                    </div>
                    <div className="rounded-xl bg-gray-950/5 border border-gray-200/50 p-5 text-sm font-mono text-gray-700 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                      {results.detection.video.audio_analysis.transcript}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8 xl:col-span-3">
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
        </section>
      )}

      {error && (
        <div className="trust-card !border-red-200 !bg-red-50/50 p-6 flex items-center gap-4 animate-shake">
          <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl shrink-0">⚠️</div>
          <div>
            <p className="text-sm font-bold text-red-900 uppercase tracking-tight">Analysis Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes move-dot {
          0% { left: 0%; }
          100% { left: 100%; }
        }
      `}} />
    </div>
  );
}

export default VideoAnalysis;
