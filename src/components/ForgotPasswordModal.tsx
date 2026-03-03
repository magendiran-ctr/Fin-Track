"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, CheckCircle, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api-client";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResetResponse {
  message: string;
  email?: string;
  resetLink?: string;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: ResetResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setSuccess(true);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
      // Auto-close after 5 seconds if no reset link
      if (!data.resetLink) {
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (resetLink) {
      await navigator.clipboard.writeText(resetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      setError("");
      setSuccess(false);
      setResetLink(null);
      setCopied(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-600">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pt-8 pb-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-800">Check your email</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      We've sent a password reset link to <span className="font-medium">{email}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      The link will expire in 1 hour. Please check your spam folder if you don't see it.
                    </p>
                  </div>

                  {resetLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3 mt-4"
                    >
                      <p className="text-xs font-medium text-emerald-900">Reset Link (for testing):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-white p-2 rounded border border-emerald-200 text-emerald-800 overflow-x-auto break-all">
                          {resetLink}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {copied && <p className="text-xs text-emerald-700 text-center">✓ Copied!</p>}
                      <Link href={resetLink} className="block">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Reset Link
                        </Button>
                      </Link>
                    </motion.div>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    className="w-full mt-4"
                  >
                    Close
                  </Button>
                </motion.div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Reset your password</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </p>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      icon={<Mail size={15} />}
                    />

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={!email || isLoading}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        Send Reset Link
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
