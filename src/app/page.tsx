"use client";

// Main application page - requires authentication - Fintech-inspired design

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Receipt, PieChart, Settings, CreditCard, Plus, IndianRupee, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseList } from "@/components/ExpenseList";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ExpenseModal } from "@/components/ExpenseModal";
import { SettingsView } from "@/components/SettingsView";
import { SubscriptionView } from "@/components/SubscriptionView";
import { Suspense } from "react";
import { expensesApi, analyticsApi } from "@/lib/api-client";
import { Expense, AnalyticsSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Tab = "dashboard" | "expenses" | "analytics" | "settings" | "subscription";

function HomeContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch and load persisted filters
  useEffect(() => {
    setMounted(true);
    // Load filters from localStorage
    const savedFilters = localStorage.getItem('expense_tracker_filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters({
          startDate: parsedFilters.startDate || filters.startDate,
          endDate: parsedFilters.endDate || filters.endDate,
        });
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && ["dashboard", "expenses", "analytics", "settings", "subscription"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('expense_tracker_filters', JSON.stringify(filters));
    }
  }, [filters, mounted]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Add event listener for 'open-expense-modal' to handle external add requests.
  useEffect(() => {
    const handleOpenModal = () => setIsExpenseModalOpen(true);
    window.addEventListener('open-expense-modal', handleOpenModal);
    return () => window.removeEventListener('open-expense-modal', handleOpenModal);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [expensesData, analyticsData] = await Promise.all([
        expensesApi.getAll({
          startDate: filters.startDate,
          endDate: filters.endDate
        }),
        analyticsApi.getMonthly()
      ]);
      setExpenses(expensesData.expenses);
      setAnalytics(analyticsData.analytics);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  // Load data when user or filters change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh data helper
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
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
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main content area */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <TopBar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          filters={filters}
          onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          {/* Mobile Greeting - visible only on small screens */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none truncate">
                Welcome, {user?.name?.split(" ")[0] || "there"} 👋
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard
                  expenses={expenses}
                  analytics={analytics}
                  isLoading={isLoading}
                  onAddExpense={handleAddExpense}
                  onViewExpenses={() => setActiveTab("expenses")}
                  filters={filters}
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
                  isLoading={isLoading}
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
                  <AnalyticsCharts analytics={analytics} isLoading={isLoading} />

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
                            { label: "Total Spent", value: formatCurrency(analytics.totalAmount) },
                            { label: "Transactions", value: String(analytics.totalExpenses) },
                            { label: "Avg. per Transaction", value: formatCurrency(analytics.averageExpense) },
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
                <SettingsView />
              </motion.div>
            )}

            {activeTab === "subscription" && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SubscriptionView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-slate-200/50 dark:border-slate-700/50 px-2 py-2">
        <div className="flex items-center justify-around">
          {[
            { tab: "dashboard" as Tab, icon: LayoutDashboard, label: "Home" },
            { tab: "expenses" as Tab, icon: IndianRupee, label: "Expenses" },
            { tab: "analytics" as Tab, icon: PieChart, label: "Analytics" },
            { tab: "subscription" as Tab, icon: CreditCard, label: "Subs" },
            { tab: "settings" as Tab, icon: Settings, label: "Settings" },
          ].map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${activeTab === tab
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-500 dark:text-slate-400"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="mobileNav"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-teal-500"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button (FAB) - Added for convenience */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddExpense}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-14 h-14 rounded-full gradient-primary text-white shadow-xl shadow-teal-500/25 flex items-center justify-center z-40 lg:hidden"
        aria-label="Add Expense"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(undefined);
        }}
        onSuccess={handleModalSuccess}
        expense={editingExpense}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
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
    }>
      <HomeContent />
    </Suspense>
  );
}
