import { useEffect, useMemo, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { VERDICT_CONFIG } from "../constants";

function getScoreColor(score) {
  if (score >= 70) {
    return "#16A34A";
  }
  if (score >= 40) {
    return "#D97706";
  }
  return "#DC2626";
}

function getSeverityLabel(score) {
  if (score >= 80) return { label: "Low Risk", className: "text-green-600" };
  if (score >= 60) return { label: "Medium Risk", className: "text-amber-600" };
  if (score >= 40) return { label: "High Risk", className: "text-red-600" };
  return { label: "Critical Risk", className: "text-red-600" };
}

function TrustScoreGauge({
  score = 0,
  verdict = "UNKNOWN",
  verdictColor = "#2563EB",
  verdictEmoji = "ℹ️",
  flags = [],
  isLoading = false,
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const gaugeColor = useMemo(() => getScoreColor(safeScore), [safeScore]);
  const severity = useMemo(() => getSeverityLabel(safeScore), [safeScore]);
  const verdictConfig = VERDICT_CONFIG?.[verdict];
  const verdictBgColor = verdictConfig?.bgColor || "bg-blue-50";
  const verdictBorderColor = verdictConfig?.borderColor || "border-blue-200";

  useEffect(() => {
    if (isLoading) {
      setAnimatedScore(0);
      return undefined;
    }

    let rafId;
    const duration = 900;
    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setAnimatedScore(Math.round(safeScore * progress));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [safeScore, isLoading]);

  return (
    <section className="rounded-2xl bg-white p-8 shadow-md">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-10">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Analyzing content confidence...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Trust Score
            </h2>
            <span className="badge-blue text-xs">AI Assessment</span>
          </div>

          <div className="mx-auto h-[150px] w-[150px] sm:h-[220px] sm:w-[220px]">
            <CircularProgressbar
              value={animatedScore}
              strokeWidth={9}
              styles={buildStyles({
                pathColor: gaugeColor,
                trailColor: "#E5E7EB",
                pathTransitionDuration: 0.25,
              })}
            />
            <div className="-mt-[98px] flex flex-col items-center sm:-mt-[140px]">
              <span className="text-4xl font-bold text-gray-900 sm:text-5xl">
                {animatedScore}
              </span>
              <span className="text-sm font-medium text-gray-500">/100</span>
              <span className={`mt-1 text-xs font-medium ${severity.className}`}>
                {severity.label}
              </span>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-gray-100" />

          <div
            className={`mt-6 rounded-xl border p-4 text-center ${verdictBgColor} ${verdictBorderColor}`}
          >
            <p className="text-2xl font-display font-bold" style={{ color: verdictColor }}>
              {verdictEmoji} {verdict}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: `${verdictColor}CC` }}
            >
              {verdictConfig?.description || ""}
            </p>
          </div>

          {flags?.length > 0 && (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                verdict === "MISINFORMATION"
                  ? "bg-red-50 border-red-200"
                  : verdict === "SUSPICIOUS"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
              }`}
            >
              <h3 className="text-sm font-semibold text-gray-800">
                ⚠️ Issues Detected
              </h3>
              <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1">
                {flags.map((flag, index) => (
                  <li
                    key={`${flag}-${index}`}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-0.5 text-gray-500">⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default TrustScoreGauge;
