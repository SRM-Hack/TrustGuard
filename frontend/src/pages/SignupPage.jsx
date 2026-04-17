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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join TruthGuard - free access to all analysis tools
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your name"
                className="input-base mt-1"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="name@company.com"
                className="input-base mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create password"
                  className="input-base mt-1"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Repeat password"
                  className="input-base mt-1"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary mt-1 w-full justify-center">
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default SignupPage;
