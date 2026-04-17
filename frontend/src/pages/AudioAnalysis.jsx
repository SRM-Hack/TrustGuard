import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
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

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !selectedFile}
          className="mt-5 inline-flex items-center rounded-lg bg-truthguard-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isLoading ? "Analyzing..." : "Analyze Audio →"}
        </button>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </section>

      {(results || isLoading) && (
        <section className="space-y-6">
          <TrustScoreGauge
            score={results?.trust_score ?? 0}
            verdict={results?.verdict ?? "SUSPICIOUS"}
            verdictColor={verdictStyle.color}
            verdictEmoji={verdictStyle.emoji}
            flags={results?.flags ?? []}
            isLoading={isLoading}
          />
          <DetectionResults detection={results?.detection ?? {}} modality="audio" />
          <ExplanationPanel
            countermeasure={results?.countermeasure}
            language={results?.language ?? "en"}
            isLoading={isLoading}
          />
          <AlternativeSources
            sources={results?.alternative_sources ?? []}
            isLoading={isLoading}
          />
        </section>
      )}
    </div>
  );
}

export default AudioAnalysis;
