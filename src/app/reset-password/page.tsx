"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Suspense } from "react";

// ─── Password Strength ──────────────────────────────────────────────────────

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score === 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { score, label: "Good", color: "#3b82f6" };
  if (score === 4) return { score, label: "Strong", color: "#10b981" };
  return { score, label: "Very Strong", color: "#059669" };
}

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? color : "#e2e8f0" }}
          />
        ))}
      </div>
      <p className="text-xs font-medium transition-colors" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

// ─── Content Component ───────────────────────────────────────────────────────

type PageState = "loading" | "invalid" | "form" | "success";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invalidReason, setInvalidReason] = useState("");
  const [userName, setUserName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Validate token on mount
  const validateToken = useCallback(async () => {
    if (!token) {
      setInvalidReason("No reset token was provided.");
      setPageState("invalid");
      return;
    }
    try {
      const res = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      const data = await res.json();
      if (data.valid) {
        setUserName(data.name || "");
        setPageState("form");
      } else {
        setInvalidReason(data.reason || "Invalid or expired reset link.");
        setPageState("invalid");
      }
    } catch {
      setInvalidReason("Could not validate reset link. Please try again.");
      setPageState("invalid");
    }
  }, [token]);

  useEffect(() => { validateToken(); }, [validateToken]);

  // Countdown redirect after success
  useEffect(() => {
    if (pageState !== "success") return;
    if (countdown === 0) { router.push("/login?reset=success"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [pageState, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");
      setPageState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const { score } = getStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">
            {pageState === "loading" && "Verifying link…"}
            {pageState === "invalid" && "Link unavailable"}
            {pageState === "form" && "Create new password"}
            {pageState === "success" && "Password updated!"}
          </h1>
          <p className="text-slate-500 mt-1">
            {pageState === "form" && "Choose a strong password for your account"}
            {pageState === "success" && `Redirecting to sign in in ${countdown}s…`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {pageState === "loading" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Validating your reset link…</p>
            </div>
          )}

          {pageState === "invalid" && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{invalidReason}</p>
              <Link href="/forgot-password">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors">
                  Request a new reset link
                </button>
              </Link>
            </div>
          )}

          {pageState === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {userName && (
                <p className="text-sm text-slate-600">
                  Hi <span className="font-semibold text-slate-800">{userName}</span>, enter your new password below.
                </p>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={password} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 disabled:opacity-50 ${confirmPassword && confirmPassword !== password
                      ? "border-red-300"
                      : "border-slate-200"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={!password || !confirmPassword || password !== confirmPassword || score < 2 || isLoading}
              >
                Update Password
              </Button>

              {score < 2 && password && (
                <p className="text-xs text-center text-slate-400">
                  Password is too weak — add uppercase, numbers, or symbols
                </p>
              )}
            </form>
          )}

          {pageState === "success" && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">Password updated successfully!</p>
                <p className="text-sm text-slate-500">
                  You can now sign in with your new password.
                </p>
              </div>
              <Link href="/login?reset=success">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors">
                  Go to Sign In
                </button>
              </Link>
            </div>
          )}
        </div>

        {(pageState === "form" || pageState === "invalid") && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Logo size="lg" className="justify-center mb-4 animate-pulse" />
          <p className="text-slate-500 text-sm">Loading reset password...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

