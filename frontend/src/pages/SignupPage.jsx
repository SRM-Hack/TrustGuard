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
    <section className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Create Your Account</h1>
      <p className="mt-1 text-sm text-gray-600">
        Join TruthGuard to manage and review misinformation analysis workflows.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Work Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="name@company.com"
            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
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
              className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
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
              Confirm
            </label>
            <input
              id="confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="Repeat password"
              className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
          Login
        </Link>
      </p>
    </section>
  );
}

export default SignupPage;
