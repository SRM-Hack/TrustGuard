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
  if (score >= 80) return { label: "Low Risk", className: "bg-green-100 text-green-700 border-green-200" };
  if (score >= 60) return { label: "Medium Risk", className: "bg-amber-100 text-amber-700 border-amber-200" };
  if (score >= 40) return { label: "High Risk", className: "bg-red-100 text-red-700 border-red-200" };
  return { label: "Critical Risk", className: "bg-red-200 text-red-800 border-red-300" };
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

  // Glow color based on score
  const glowClass = useMemo(() => {
    if (safeScore >= 70) return "bg-green-500/20 shadow-[0_0_40px_rgba(22,163,74,0.3)]";
    if (safeScore >= 40) return "bg-amber-500/20 shadow-[0_0_40px_rgba(217,119,6,0.3)]";
    return "bg-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.3)]";
  }, [safeScore]);

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
    <section className="trust-card relative overflow-visible group">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="relative">
            <div className="h-[200px] w-[200px] rounded-full skeleton-shimmer" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-blue-500" />
            </div>
          </div>
          <div className="space-y-3 w-full max-w-[200px]">
            <div className="h-4 w-full skeleton-shimmer" />
            <div className="h-4 w-2/3 skeleton-shimmer mx-auto" />
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic Background Glow */}
          <div className={`absolute -inset-0.5 rounded-2xl blur-2xl opacity-40 transition-all duration-500 ${glowClass}`} />
          
          <div className="relative z-10">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Analysis Engine
              </h2>
              <span className="badge-blue !px-3 !py-1 text-[10px] font-bold uppercase tracking-wider animate-glow-pulse">
                Live Assessment
              </span>
            </div>

            <div className="relative mx-auto flex items-center justify-center py-4" style={{ perspective: '1200px' }}>
              {/* 3D Gauge Container */}
              <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]" style={{ transformStyle: 'preserve-3d' }}>
                {/* Decorative Rings */}
                <div 
                  className="absolute inset-[-15px] rounded-full border-4 border-dashed opacity-10 animate-spin-slow" 
                  style={{ borderColor: gaugeColor }} 
                />
                <div 
                  className="absolute inset-[-5px] rounded-full border-2 opacity-20" 
                  style={{ borderColor: gaugeColor }} 
                />
                
                <CircularProgressbar
                  value={animatedScore}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: gaugeColor,
                    trailColor: "rgba(0,0,0,0.05)",
                    strokeLinecap: "round",
                    pathTransitionDuration: 0.25,
                  })}
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-5xl font-bold font-display tracking-tight" style={{ color: gaugeColor }}>
                      {animatedScore}
                    </span>
                    <span className="text-lg font-medium text-gray-400">/100</span>
                  </div>
                  <div className={`mt-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest shadow-sm ${severity.className}`}>
                    {severity.label}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              {/* Verdict Banner */}
              <div 
                className="glass-blue border-2 p-5 text-center transition-all duration-300 transform group-hover:scale-[1.02]"
                style={{ 
                  backgroundColor: `${verdictColor}08`,
                  borderColor: `${verdictColor}20`
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl filter drop-shadow-md">{verdictEmoji}</span>
                  <p className="text-2xl font-display font-black tracking-tight uppercase" style={{ color: verdictColor }}>
                    {verdict}
                  </p>
                  <p className="text-xs font-medium leading-relaxed max-w-[240px] mx-auto text-gray-500">
                    {verdictConfig?.description || "Assessment complete. No further action required."}
                  </p>
                </div>
              </div>

              {/* Issues Section */}
              {flags?.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-orange-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Issues Detected
                    </h3>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    <ul className="space-y-2.5">
                      {flags.map((flag, index) => (
                        <li
                          key={`${flag}-${index}`}
                          className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 border-l-[3px] border-orange-400 text-sm text-gray-700 transition-colors hover:bg-orange-50/30"
                        >
                          <span className="text-orange-500 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="font-medium">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default TrustScoreGauge;
