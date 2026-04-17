import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ErrorBoundary from "../components/ErrorBoundary";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LoadingOverlay from "../components/LoadingOverlay";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeImage } from "../api/truthguard";
import { useLanguage } from "../context/LanguageContext";
import { analysisTranslations } from "../locales/translations";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";
import { downloadReport, generateShareLink, generateSummary } from "../utils/reportGenerator";

function ImageAnalysis() {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
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

  const verdictStyle = useMemo(
    () => getVerdictPresentation(results?.verdict),
    [results?.verdict]
  );

  const formatBytes = (bytes = 0) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const units = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
  };

  const onAnalyze = async () => {
    if (!selectedFile) {
      toast.error(t("uploadImageError", analysisTranslations) || "Please upload an image first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeImage(selectedFile);
      const normalized = normalizeAnalysisResults(payload);
      setResults(normalized);
      
      // Save to session history
      saveAnalysisToSession({
        id: `${Date.now()}-image`,
        time: new Date().toISOString(),
        modality: "image",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: language,
        results: normalized,
      });

      toast.success(t("analysisSuccess", analysisTranslations) || "Image analysis completed.");
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const message = err?.message || "Unable to analyze image right now.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onCopySummary = async () => {
    if (!results) return;
    const summary = generateSummary({
      modality: "image",
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
      modality: "image",
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
      modality: "image",
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
    setError(null);
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* HEADER SECTION */}
      <section className="trust-card p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <span className="text-8xl">🖼️</span>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
              {t("imageTitle", analysisTranslations)}
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
              {t("imageSub", analysisTranslations)}
            </p>
          </div>

          <div className="glass-blue p-5 border border-blue-200/40 rounded-2xl flex items-start gap-4 animate-fade-in-up">
            <div className="text-blue-600 text-xl pt-0.5">ℹ️</div>
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              TruthGuard runs <span className="font-bold">TWO independent ViT models</span> simultaneously. We analyze high-frequency artifacts and facial inconsistencies to ensure 92%–98.7% detection accuracy.
            </p>
          </div>

          {/* UPLOAD AREA */}
          <div className="grid gap-8 lg:grid-cols-2 pt-4">
            <div className="space-y-6">
              <FileUpload
                accept="image/jpeg,image/png,image/webp,image/gif"
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />

              {selectedFile && (
                <div className="flex flex-wrap gap-2 animate-fade-in">
                  <span className="badge-blue !bg-blue-50 !border-blue-100 text-[10px] font-bold uppercase">
                    {selectedFile.name.length > 20 ? selectedFile.name.substring(0, 17) + '...' : selectedFile.name}
                  </span>
                  <span className="badge-blue !bg-blue-50 !border-blue-100 text-[10px] font-bold">
                    {formatBytes(selectedFile.size)}
                  </span>
                  <span className="badge-blue !bg-blue-50 !border-blue-100 text-[10px] font-bold">
                    {selectedFile.type.split('/')[1].toUpperCase()}
                  </span>
                </div>
              )}

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
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="relative group">
              {previewUrl ? (
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-up border-4 border-white aspect-video bg-gray-50 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Analysis source"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="text-white text-xs font-bold uppercase tracking-widest">
                      Previewing: {selectedFile?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[240px] rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <span className="text-5xl grayscale opacity-30">🖼️</span>
                  <p className="text-xs font-bold uppercase tracking-widest">No Image Selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      {(results || isLoading) && (
        <section ref={resultsRef} className="relative pt-4">
          <LoadingOverlay isLoading={isLoading} />
          
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
                  modality="image"
                />
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
    </div>
  );
}

export default ImageAnalysis;
