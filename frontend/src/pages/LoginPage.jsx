import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { authTranslations } from "../locales/translations";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
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
    if (!email) nextErrors.email = t("emailRequired", authTranslations);
    if (email && !isValidEmail(email)) nextErrors.email = t("emailInvalid", authTranslations);
    if (!password) nextErrors.password = t("passwordRequired", authTranslations);
    if (password && password.length < 8) {
      nextErrors.password = t("passwordMinLength", authTranslations);
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t("highlightedError", authTranslations));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login({ email });
      setIsSubmitting(false);
      toast.success(t("loginSuccess", authTranslations));
      navigate(location.state?.from || "/analyze/text");
    }, 650);
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="trust-card max-w-md w-full p-8 sm:p-10 animate-fade-in-up shadow-float relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 text-blue-600 mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.4 4 5.9v6.5c0 5.4 3.4 9.9 8 11.2 4.6-1.3 8-5.8 8-11.2V5.9L12 2.4Z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
            {t("loginTitle", authTranslations)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("loginSub", authTranslations)}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
              {t("emailLabel", authTranslations)}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder", authTranslations)}
              className={`input-base w-full ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium ml-1">
                <span>⚠️</span> {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
              {t("passwordLabel", authTranslations)}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder", authTranslations)}
                className={`input-base w-full pr-12 ${errors.password ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <span className="text-lg">👁️</span>
                ) : (
                  <span className="text-lg">👁️‍🗨️</span>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium ml-1">
                <span>⚠️</span> {errors.password}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 text-base flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t("loginBtn", authTranslations)}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {t("noAccount", authTranslations)}{" "}
            <Link to="/signup" className="text-blue-600 font-bold hover:underline">
              {t("signupBtn", authTranslations)}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
