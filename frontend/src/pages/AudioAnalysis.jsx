import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ErrorBoundary from "../components/ErrorBoundary";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LanguageSelector from "../components/LanguageSelector";
import LoadingOverlay from "../components/LoadingOverlay";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeAudio } from "../api/truthguard";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";
import { downloadReport, generateShareLink, generateSummary } from "../utils/reportGenerator";

const LOADING_MESSAGES = [
  "Transcribing audio with Whisper AI...",
  "Detecting voice cloning signatures...",
  "Fact-checking transcript against verified databases...",
  "Calculating final trust score...",
];

function AudioAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [audioDuration, setAudioDuration] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setAudioDuration(null);
      return undefined;
    }
    const audio = new Audio();
    audio.src = URL.createObjectURL(selectedFile);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };
    return () => URL.revokeObjectURL(audio.src);
  }, [selectedFile]);

  const verdictStyle = useMemo(
    () => getVerdictPresentation(results?.verdict),
    [results?.verdict]
  );

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please upload an audio file first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeAudio(selectedFile, selectedLanguage);
      const normalized = normalizeAnalysisResults(payload);
      setResults(normalized);

      saveAnalysisToSession({
        id: `${Date.now()}-audio`,
        time: new Date().toISOString(),
        modality: "audio",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: normalized.language || selectedLanguage,
        results: normalized,
      });

      toast.success("Audio analysis completed.");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const message = err?.message || "Unable to analyze audio right now.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onCopySummary = async () => {
    if (!results) return;
    const summary = generateSummary({
      modality: "audio",
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
      modality: "audio",
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
      modality: "audio",
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

  const handleNewAnalysis = () => {
    setResults(null);
    setSelectedFile(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* HEADER SECTION */}
      <section className="trust-card p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <span className="text-8xl">🎙️</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
              Audio Analysis
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
              Transcribe audio and detect AI-cloned or synthesized voices using state-of-the-art neural analysis.
            </p>
          </div>

          <div className="glass-blue !bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4 animate-fade-in-up">
            <div className="text-amber-600 text-xl pt-0.5">⏱️</div>
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              <span className="font-bold">First-run note:</span> Whisper transcription model loads on first use (~30 seconds). Subsequent analyses are significantly faster.
            </p>
          </div>

          {/* FEATURE INFO CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { icon: "🗣️", title: "Voice Clone Detection", desc: "Detects AI-synthesized audio via wav2vec2" },
              { icon: "📝", title: "Auto Transcription", desc: "Whisper AI transcribes Hindi, Telugu & English" },
              { icon: "🔍", title: "Fact Verification", desc: "Transcript is cross-checked against fact databases" },
            ].map((feature, idx) => (
              <div key={idx} className="trust-card !p-4 flex flex-col gap-2 border-none shadow-sm bg-white/40">
                <span className="text-2xl">{feature.icon}</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">{feature.title}</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* UPLOAD AREA */}
          <div className="space-y-6 pt-4">
            <FileUpload
              accept="audio/wav,audio/mp3,audio/mpeg,audio/m4a,audio/ogg"
              maxSizeMB={50}
              onFileSelected={setSelectedFile}
              label="Source Audio"
              icon="🎙️"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
              
              <div className="flex items-center gap-3">
                {selectedFile && (
                  <div className="badge-blue !bg-blue-50 !border-blue-100 text-[10px] font-bold py-2 px-4 flex items-center gap-2">
                    <span className="opacity-50">DURATION:</span>
                    <span>{formatDuration(audioDuration)}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isLoading || !selectedFile}
                  className="btn-primary h-12 px-8 text-base group"
                >
                  {isLoading ? "Processing..." : "Analyze Audio"}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      {(results || isLoading) && (
        <section ref={resultsRef} className="relative pt-4">
          <LoadingOverlay isLoading={isLoading} messages={LOADING_MESSAGES} />
          
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
                  modality="audio"
                />

                {results?.detection?.audio?.transcript && (
                  <div className="trust-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        <h3 className="font-display font-bold text-gray-900">Transcription Result</h3>
                      </div>
                      <span className="badge-blue !text-[10px] uppercase font-black">
                        {results?.language?.toUpperCase() || "AUTO"}
                      </span>
                    </div>
                    <div className="rounded-xl bg-gray-950/5 border border-gray-200/50 p-5 text-sm font-mono text-gray-700 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                      {results.detection.audio.transcript}
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
                
                {results && (
                  <div className="flex justify-center flex-wrap gap-3 pt-4">
                    <button onClick={onCopySummary} className="btn-secondary h-12 px-6">
                      📋 Copy Summary
                    </button>
                    <button onClick={onShareLink} className="btn-secondary h-12 px-6">
                      🔗 Share Link
                    </button>
                    <button onClick={onDownloadReport} className="btn-secondary h-12 px-6">
                      ⬇️ Download Report
                    </button>
                    <button onClick={handleNewAnalysis} className="btn-secondary h-12 px-6 !text-red-600 hover:!bg-red-50">
                      Reset & New Analysis
                    </button>
                  </div>
                )}
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

export default AudioAnalysis;
