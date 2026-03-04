"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [resetLink, setResetLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Something went wrong");

            setSubmitted(true);
            if (data.resetLink) setResetLink(data.resetLink);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!resetLink) return;
        await navigator.clipboard.writeText(resetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Logo size="lg" className="justify-center mb-4" />
                    <h1 className="text-2xl font-bold text-slate-800">
                        {submitted ? "Check your email" : "Forgot password?"}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {submitted
                            ? `We sent a reset link to ${email}`
                            : "No worries, we'll send you reset instructions"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {submitted ? (
                        <div className="space-y-5">
                            {/* Success icon */}
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    We've sent a password reset link to{" "}
                                    <span className="font-semibold text-slate-800">{email}</span>.
                                    Please check your inbox and spam folder.
                                </p>
                                <p className="text-xs text-slate-400">The link expires in 30 minutes.</p>
                            </div>

                            {/* Dev fallback: show reset link when email isn't configured */}
                            {resetLink && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                                        Dev Mode — Reset Link
                                    </p>
                                    <p className="text-xs text-emerald-700 leading-relaxed">
                                        Email not configured. Use this link to test the reset flow:
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <code className="flex-1 text-xs bg-white border border-emerald-200 rounded-lg p-2 text-emerald-800 break-all leading-relaxed">
                                            {resetLink}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            title="Copy link"
                                            className="mt-0.5 p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {copied && (
                                        <p className="text-xs text-emerald-700 text-center font-medium">✓ Copied!</p>
                                    )}
                                    <a href={resetLink} className="block">
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open Reset Link
                                        </button>
                                    </a>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => { setSubmitted(false); setResetLink(null); setEmail(""); }}
                                className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors py-2"
                            >
                                Didn't receive it? Try a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled={isLoading}
                                icon={<Mail size={15} />}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={isLoading}
                                disabled={!email || isLoading}
                            >
                                Send Reset Email
                            </Button>
                        </form>
                    )}
                </div>

                {/* Back to sign in */}
                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
