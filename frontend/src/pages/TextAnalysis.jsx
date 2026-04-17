import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import AlternativeSources from "../components/AlternativeSources";
import DetectionResults from "../components/DetectionResults";
import ExplanationPanel from "../components/ExplanationPanel";
import FileUpload from "../components/FileUpload";
import LanguageSelector from "../components/LanguageSelector";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { analyzeText } from "../api/truthguard";
import {
  getVerdictPresentation,
  normalizeAnalysisResults,
  saveAnalysisToSession,
} from "../utils/analysisSession";

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
          className="mt-5 inline-flex items-center rounded-lg bg-truthguard-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isLoading ? "Analyzing..." : "Analyze Text →"}
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
          <DetectionResults detection={results?.detection ?? {}} modality="text" />
          <ExplanationPanel
            countermeasure={results?.countermeasure}
            language={results?.language ?? selectedLanguage}
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

export default TextAnalysis;
