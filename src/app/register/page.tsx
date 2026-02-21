"use client";

// Register page

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 mt-1">Start tracking your expenses today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              icon={<User size={15} />}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              icon={<Mail size={15} />}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              icon={<Lock size={15} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "🔒", label: "Secure" },
            { icon: "📊", label: "Analytics" },
            { icon: "📱", label: "Mobile Ready" },
          ].map((f) => (
            <div key={f.label} className="bg-white/60 rounded-xl p-3 border border-slate-100">
              <p className="text-xl mb-1">{f.icon}</p>
              <p className="text-xs text-slate-500 font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
