import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!email) nextErrors.email = "Email is required.";
    if (email && !isValidEmail(email)) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Password is required.";
    if (password && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login({ email });
      setIsSubmitting(false);
      toast.success("Login successful.");
      navigate(location.state?.from || "/analyze/text");
    }, 650);
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center">
      <div className="grid w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-100 shadow-md lg:grid-cols-2">
        <div className="hidden w-full rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-10 text-white lg:block">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-16 w-16 text-blue-400"
            aria-hidden="true"
          >
            <path d="M12 2.4 4 5.9v6.5c0 5.4 3.4 9.9 8 11.2 4.6-1.3 8-5.8 8-11.2V5.9L12 2.4Z" />
          </svg>
          <h2 className="mt-5 font-display text-3xl font-bold text-white">TruthGuard</h2>
          <p className="mt-3 text-sm text-blue-200/80">
            AI-powered multimodal misinformation detection and counter-response
            platform
          </p>
          <div className="mt-6 space-y-2 text-sm text-blue-200">
            <p className="flex items-center gap-2">✓ Text, Image, Audio &amp; Video analysis</p>
            <p className="flex items-center gap-2">✓ Hindi, Telugu &amp; English support</p>
            <p className="flex items-center gap-2">✓ Explainable AI verdicts</p>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-sm sm:p-10 lg:w-1/2">
          <h1 className="font-display text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your TruthGuard workspace
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input-base mt-1"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
