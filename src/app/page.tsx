"use client";

// Main application page - requires authentication

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseList } from "@/components/ExpenseList";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ExpenseModal } from "@/components/ExpenseModal";
import { expensesApi, analyticsApi } from "@/lib/api-client";
import { Expense, AnalyticsSummary } from "@/lib/types";

type Tab = "dashboard" | "expenses" | "analytics";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <Dashboard
            expenses={expenses}
            analytics={analytics}
            isLoading={isLoadingExpenses}
            onAddExpense={handleAddExpense}
            onViewExpenses={() => setActiveTab("expenses")}
          />
        )}

        {activeTab === "expenses" && (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onAdd={handleAddExpense}
            onRefresh={handleRefresh}
            isLoading={isLoadingExpenses}
          />
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Insights into your spending patterns
              </p>
            </div>
            <AnalyticsCharts analytics={analytics} isLoading={isLoadingAnalytics} />

            {/* Summary stats */}
            {analytics && analytics.totalExpenses > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Spent", value: `$${analytics.totalAmount.toFixed(2)}` },
                    { label: "Transactions", value: String(analytics.totalExpenses) },
                    { label: "Avg. per Transaction", value: `$${analytics.averageExpense.toFixed(2)}` },
                    { label: "Top Category", value: analytics.topCategory || "N/A" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
