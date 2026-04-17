import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Full name is required.";
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (formData.email && !isValidEmail(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) nextErrors.password = "Password is required.";
    if (formData.password && formData.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }
    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.agreeTerms) {
      nextErrors.agreeTerms = "You must agree to the terms.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login({ email: formData.email, name: formData.name });
      setIsSubmitting(false);
      toast.success("Account created successfully.");
      navigate("/analyze/text");
    }, 700);
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
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
          <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join TruthGuard - free access to all tools</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
              className={`input-base w-full ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium ml-1">
                <span>⚠️</span> {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="name@company.com"
              className={`input-base w-full ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium ml-1">
                <span>⚠️</span> {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min. 8 chars"
                  className={`input-base w-full ${errors.password ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium ml-1">
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                Confirm
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Repeat password"
                className={`input-base w-full ${errors.confirmPassword ? 'border-red-400' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium ml-1">
                  <span>⚠️</span> {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1 ml-1">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => updateField("agreeTerms", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agreeTerms" className="text-xs text-gray-600 leading-relaxed">
              I agree to the <a href="#" className="text-blue-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>.
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.agreeTerms}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center group h-11 mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Create account</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default SignupPage;
