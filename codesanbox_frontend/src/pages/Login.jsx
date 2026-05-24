import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export const Login = () => {
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const [emailid, setEmailid] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    setAuthError(null);
    setGeneralError("");
    setFieldErrors({});
  }, [emailid, password, setAuthError]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailid)) errors.emailid = "Enter a valid email.";
    if (!password.trim()) errors.password = "Enter your password.";
    return errors;
  };

  const parseBackendErrors = (message) => {
    if (!message) return;
    const errors = {};

    message.split(",").map((item) => item.trim()).forEach((item) => {
      const lower = item.toLowerCase();
      if (lower.includes("email")) errors.emailid = item;
      else if (lower.includes("password")) errors.password = item;
      else setGeneralError(item);
    });

    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setGeneralError(message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(emailid, password);

    if (result.success) {
      navigate("/home");
    } else {
      parseBackendErrors(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Enter your email and password to open your workspace.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {(generalError || authError) && (
          <div className="flex items-start gap-2 rounded-md border border-red-300/40 bg-red-950/30 p-3 font-mono text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{generalError || authError}</span>
          </div>
        )}

        <div>
          <label className="font-mono text-sm text-white/70">Email</label>
          <input
            type="email"
            value={emailid}
            onChange={(event) => setEmailid(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-md border border-white/20 bg-black px-3 py-3 font-mono text-base text-white outline-none focus:border-cyan-300"
          />
          {fieldErrors.emailid && <p className="mt-2 font-mono text-sm text-red-300">{fieldErrors.emailid}</p>}
        </div>

        <div>
          <label className="font-mono text-sm text-white/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="your password"
            className="mt-2 w-full rounded-md border border-white/20 bg-black px-3 py-3 font-mono text-base text-white outline-none focus:border-cyan-300"
          />
          {fieldErrors.password && <p className="mt-2 font-mono text-sm text-red-300">{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-3 font-mono text-base font-semibold text-black hover:bg-emerald-300 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Login
        </button>

        <p className="text-center text-sm text-white/60">
          Need an account?{" "}
          <Link to="/signup" className="font-mono text-cyan-300 hover:text-emerald-300">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
