import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Multimodal Detection",
    description:
      "Analyze text, image, audio, and video misinformation in one professional workflow.",
    icon: "🛡️",
  },
  {
    title: "Explainable Verdicts",
    description:
      "Go beyond raw scores with AI explanations, flags, and confidence indicators.",
    icon: "🧠",
  },
  {
    title: "Verified Alternatives",
    description:
      "Surface credible sources and fact-check context to support better decisions.",
    icon: "📰",
  },
];

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 shadow-md">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 p-10 sm:p-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
            🛡️ TruthGuard · CodeWizards 2.0 · Problem Statement #5
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl font-display">
            AI that doesn't just detect - it{" "}
            <span className="text-blue-400">explains &amp; corrects</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-blue-200/80">
            Multimodal misinformation detection for text, images, audio &amp;
            video. Supports English, Hindi, and Telugu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? "/analyze/text" : "/login"}
              className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              {isAuthenticated ? "Open Workspace →" : "Get Started →"}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>

        <div className="absolute right-8 top-1/2 hidden w-64 -translate-y-1/2 xl:block">
          <div className="relative rounded-2xl border border-white/10 bg-white/10 p-5 text-sm backdrop-blur-sm">
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-blue-500/10 blur-xl" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Trust Score</span>
                <span className="text-lg font-semibold text-green-400 animate-pulse">
                  73
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Verdict</span>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 font-semibold text-green-300">
                  ✅ TRUSTED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Language</span>
                <span className="font-semibold text-white">Hindi (हिन्दी)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Modules</span>
                <span className="font-semibold text-white">
                  Text · Fact Check · LLM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="trust-card text-center">
          <p className="text-3xl font-bold text-truthguard-blue font-display">4</p>
          <p className="mt-1 text-xs text-gray-500">Analysis Modalities</p>
        </div>
        <div className="trust-card text-center">
          <p className="text-3xl font-bold text-truthguard-blue font-display">3</p>
          <p className="mt-1 text-xs text-gray-500">Languages Supported</p>
        </div>
        <div className="trust-card text-center">
          <p className="text-3xl font-bold text-truthguard-blue font-display">6</p>
          <p className="mt-1 text-xs text-gray-500">AI Models Used</p>
        </div>
        <div className="trust-card text-center">
          <p className="text-3xl font-bold text-truthguard-blue font-display">
            100%
          </p>
          <p className="mt-1 text-xs text-gray-500">Explainable Results</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((item, index) => (
          <article key={item.title} className="trust-card-hover space-y-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl p-3 text-xl ${
                index === 0
                  ? "bg-blue-50"
                  : index === 1
                    ? "bg-purple-50"
                    : "bg-green-50"
              }`}
            >
              {item.icon}
            </div>
            <h3 className="font-display font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="trust-card mt-6">
        <h2 className="font-display text-gray-900 font-semibold">
          How TruthGuard Works
        </h2>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {[
            { n: "1", icon: "📥", label: "Input Content" },
            { n: "2", icon: "🔍", label: "AI Detection" },
            { n: "3", icon: "✅", label: "Fact Verification" },
            { n: "4", icon: "💡", label: "Explanation + Alternatives" },
          ].map((step, idx) => (
            <div key={step.n} className="flex items-center gap-3 md:flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {step.icon} {step.label}
                </p>
              </div>
              {idx < 3 && (
                <div className="ml-2 hidden h-px flex-1 border-t border-dashed border-gray-300 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
