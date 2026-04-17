import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeImage } from "../api/truthguard";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";

function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

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

  const onAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please upload an image first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const payload = await analyzeImage(selectedFile);
      const normalized = normalizeAnalysisResults(payload);
      setResults(normalized);
      saveAnalysisToSession({
        id: `${Date.now()}-image`,
        time: new Date().toISOString(),
        modality: "image",
        trust_score: normalized.trust_score,
        verdict: normalized.verdict,
        language: normalized.language,
        results: normalized,
      });
      toast.success("Image analysis completed.");
    } catch (err) {
      const message = err?.message || "Unable to analyze image right now.";
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
          🖼️ Image Deepfake Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload an image to run Vision Transformer based deepfake checks and
          credibility scoring.
        </p>

        <div className="mt-5">
          <FileUpload
            accept="image/png,image/jpeg,image/jpg,image/webp"
            maxSizeMB={20}
            onFileSelected={setSelectedFile}
            label="Upload Image"
            icon="🖼️"
          />
        </div>

        {previewUrl && (
          <div className="mt-4">
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="max-h-64 rounded-xl border border-gray-200 object-contain"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !selectedFile}
          className="mt-5 inline-flex items-center rounded-lg bg-truthguard-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isLoading ? "Analyzing..." : "Analyze Image →"}
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
          <DetectionResults detection={results?.detection ?? {}} modality="image" />
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

export default ImageAnalysis;
