"use client";

// Main dashboard with stats and recent expenses - Fintech-inspired design

import React from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, ShoppingBag, Calendar, Plus, TrendingDown, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Expense, AnalyticsSummary, CATEGORY_COLORS } from "@/lib/types";
import { formatCurrency, formatDate, getCurrentMonth, getMonthFromDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardProps {
  expenses: Expense[];
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
  onAddExpense: () => void;
  onViewExpenses: () => void;
  filters: { startDate: string; endDate: string };
}

export function Dashboard({
  expenses,
  analytics,
  isLoading,
  onAddExpense,
  onViewExpenses,
  filters
}: DashboardProps) {
  const { user } = useAuth();
  // Use passed filters for calculations
  const filteredExpenses = expenses; // expenses are already filtered by the API call in page.tsx
  const totalInPeriod = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Show a slightly longer preview on the dashboard while keeping the expenses page paginated at 10
  const recentExpenses = expenses.slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner with gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl gradient-primary p-5 sm:p-6 lg:p-8"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-teal-100 text-sm font-medium">Selected Period Spending</p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mt-1 text-white"
            >
              {formatCurrency(totalInPeriod)}
            </motion.p>
            <p className="text-teal-100 text-xs mt-2 opacity-80">
              {filters.startDate && filters.endDate
                ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
                : "All time"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="secondary"
              onClick={onAddExpense}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm w-full sm:w-auto"
            >
              <Plus size={16} />
              Add Expense
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >

          <StatCard
            title="Total in Period"
            value={formatCurrency(totalInPeriod)}
            subtitle="Selected range"
            icon={<IndianRupee size={20} />}
            color="green"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            title="Transactions"
            value={String(filteredExpenses.length)}
            subtitle="In period"
            icon={<CalendarCheck size={20} />}
            color="blue"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Avg. Expense"
            value={formatCurrency(filteredExpenses.length > 0 ? totalInPeriod / filteredExpenses.length : 0)}
            subtitle="Per transaction"
            icon={<TrendingUp size={20} />}
            color="purple"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatCard
            title="Total tracked"
            value={formatCurrency(analytics?.totalAmount || 0)}
            subtitle="All time"
            icon={<ShoppingBag size={20} />}
            color="orange"
          />
        </motion.div>
      </div>

      {/* Recent expenses + top categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="glass card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recent Expenses</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your latest transactions</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onViewExpenses}>
                View all
              </Button>
            </div>
            {recentExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Plus className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">No expenses yet</p>
                <p className="text-slate-400 text-sm mt-1">Start tracking your spending</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={onAddExpense}>
                  <Plus size={14} />
                  Add First Expense
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}20` }}
                    >
                      <CategoryIcon
                        category={expense.category}
                        size={20}
                        style={{ color: CATEGORY_COLORS[expense.category] }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{expense.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(expense.date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-shrink-0">
                      {formatCurrency(expense.amount)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="glass card h-full">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Top Categories</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Spending by category</p>
            </div>
            {!analytics || analytics.categoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <TrendingUp className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No data yet</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {analytics.categoryData.slice(0, 5).map((cat, index) => (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={cat.category} size={16} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.category}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: CATEGORY_COLORS[cat.category],
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{cat.percentage.toFixed(1)}%</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
