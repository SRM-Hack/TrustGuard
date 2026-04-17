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
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sign in to access the TruthGuard analysis workspace.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Work Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        New to TruthGuard?{" "}
        <Link to="/signup" className="font-semibold text-blue-700 hover:text-blue-800">
          Create account
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
