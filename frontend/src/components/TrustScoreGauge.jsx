import { useEffect, useMemo, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function getScoreColor(score) {
  if (score >= 70) {
    return "#16A34A";
  }
  if (score >= 40) {
    return "#D97706";
  }
  return "#DC2626";
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
          <div className="mx-auto h-[150px] w-[150px] sm:h-[200px] sm:w-[200px]">
            <CircularProgressbar
              value={animatedScore}
              strokeWidth={9}
              styles={buildStyles({
                pathColor: gaugeColor,
                trailColor: "#E5E7EB",
                pathTransitionDuration: 0.25,
              })}
            />
            <div className="-mt-[98px] flex flex-col items-center sm:-mt-[126px]">
              <span className="text-4xl font-bold text-gray-900 sm:text-5xl">
                {animatedScore}
              </span>
              <span className="text-sm font-medium text-gray-500">/100</span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p
              className="text-xl font-bold sm:text-2xl"
              style={{ color: verdictColor || gaugeColor }}
            >
              {verdictEmoji} {verdict}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {safeScore >= 70 &&
                "Content appears to be authentic and verifiable."}
              {safeScore >= 40 &&
                safeScore < 70 &&
                "Some warning signals found. Verify supporting evidence."}
              {safeScore < 40 &&
                "High risk of misinformation. Independent verification recommended."}
            </p>
          </div>

          {flags?.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-700">
                ⚠️ Issues Detected
              </h3>
              <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1">
                {flags.map((flag, index) => (
                  <li
                    key={`${flag}-${index}`}
                    className="flex items-start gap-2 text-sm text-amber-800"
                  >
                    <span className="mt-0.5 text-amber-600">⚠</span>
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
