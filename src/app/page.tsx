"use client";

// Main application page - requires authentication - Fintech-inspired design

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseList } from "@/components/ExpenseList";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ExpenseModal } from "@/components/ExpenseModal";
import { expensesApi, analyticsApi } from "@/lib/api-client";
import { Expense, AnalyticsSummary } from "@/lib/types";

type Tab = "dashboard" | "expenses" | "analytics" | "settings";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && ["dashboard", "expenses", "analytics", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setIsLoadingExpenses(true);
    try {
      const data = await expensesApi.getAll();
      setExpenses(data.expenses);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [user]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setIsLoadingAnalytics(true);
    try {
      const data = await analyticsApi.getMonthly();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchAnalytics();
    }
  }, [user, fetchExpenses, fetchAnalytics]);

  // Refresh all data
  const handleRefresh = useCallback(() => {
    fetchExpenses();
    fetchAnalytics();
  }, [fetchExpenses, fetchAnalytics]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    handleRefresh();
  };

  // Show loading while checking auth
  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <TopBar onAddExpense={handleAddExpense} />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  expenses={expenses}
                  analytics={analytics}
                  isLoading={isLoadingExpenses}
                  onAddExpense={handleAddExpense}
                  onViewExpenses={() => setActiveTab("expenses")}
                />
              </motion.div>
            )}

            {activeTab === "expenses" && (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ExpenseList
                  expenses={expenses}
                  onEdit={handleEditExpense}
                  onAdd={handleAddExpense}
                  onRefresh={handleRefresh}
                  isLoading={isLoadingExpenses}
                />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Analytics</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Insights into your spending patterns
                    </p>
                  </motion.div>
                  <AnalyticsCharts analytics={analytics} isLoading={isLoadingAnalytics} />

                  {/* Summary stats */}
                  {analytics && analytics.totalExpenses > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="glass card p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Summary</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { label: "Total Spent", value: `₹${analytics.totalAmount.toFixed(2)}` },
                            { label: "Transactions", value: String(analytics.totalExpenses) },
                            { label: "Avg. per Transaction", value: `₹${analytics.averageExpense.toFixed(2)}` },
                            { label: "Top Category", value: analytics.topCategory || "N/A" },
                          ].map((stat, index) => (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                            >
                              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass card p-6 max-w-2xl">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Settings</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Manage your account preferences
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</p>
                      <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Plan</p>
                      <p className="text-slate-500 dark:text-slate-400">Free Plan</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSuccess={handleModalSuccess}
        expense={editingExpense}
      />
    </div>
  );
}
