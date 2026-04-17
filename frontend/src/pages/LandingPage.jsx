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
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-md sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
          TruthGuard Platform
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          AI-powered misinformation detection and counter-response
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-blue-100 sm:text-base">
          Detect harmful content, explain why it is risky, and guide users toward
          verified alternatives with a clean, judge-ready interface.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={isAuthenticated ? "/analyze/text" : "/login"}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow hover:bg-blue-50"
          >
            {isAuthenticated ? "Go to Workspace" : "Get Started"}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="rounded-lg border border-blue-200 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((item) => (
          <article key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-2xl">{item.icon}</p>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default LandingPage;
