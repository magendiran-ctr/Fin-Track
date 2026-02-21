"use client";

// Main dashboard with stats and recent expenses

import React from "react";
import { DollarSign, TrendingUp, ShoppingBag, Calendar, Plus } from "lucide-react";
import { StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Expense, AnalyticsSummary, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { formatCurrency, formatDate, getCurrentMonth, getMonthFromDate } from "@/lib/utils";

interface DashboardProps {
  expenses: Expense[];
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
  onAddExpense: () => void;
  onViewExpenses: () => void;
}

export function Dashboard({
  expenses,
  analytics,
  isLoading,
  onAddExpense,
  onViewExpenses,
}: DashboardProps) {
  const currentMonth = getCurrentMonth();
  const thisMonthExpenses = expenses.filter(
    (e) => getMonthFromDate(e.date) === currentMonth
  );
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthTotal = expenses
    .filter((e) => getMonthFromDate(e.date) === lastMonthKey)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyChange =
    lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : 0;

  const recentExpenses = expenses.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-7 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">This Month&apos;s Spending</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(thisMonthTotal)}</p>
            {lastMonthTotal > 0 && (
              <p className="text-emerald-100 text-sm mt-2">
                {monthlyChange >= 0 ? "↑" : "↓"} {Math.abs(monthlyChange)}% vs last month
              </p>
            )}
          </div>
          <div className="hidden sm:block">
            <Button
              variant="secondary"
              onClick={onAddExpense}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Plus size={16} />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(analytics?.totalAmount || 0)}
          subtitle="All time"
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(thisMonthTotal)}
          subtitle={`${thisMonthExpenses.length} transactions`}
          icon={<Calendar size={20} />}
          color="blue"
          trend={
            lastMonthTotal > 0
              ? { value: monthlyChange, label: "vs last month" }
              : undefined
          }
        />
        <StatCard
          title="Avg. Expense"
          value={formatCurrency(analytics?.averageExpense || 0)}
          subtitle="Per transaction"
          icon={<TrendingUp size={20} />}
          color="purple"
        />
        <StatCard
          title="Total Transactions"
          value={String(analytics?.totalExpenses || 0)}
          subtitle="All time"
          icon={<ShoppingBag size={20} />}
          color="orange"
        />
      </div>

      {/* Recent expenses + top categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent expenses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Expenses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your latest transactions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onViewExpenses}>
              View all
            </Button>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p className="text-slate-600 font-medium">No expenses yet</p>
              <p className="text-slate-400 text-sm mt-1">Start tracking your spending</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={onAddExpense}>
                <Plus size={14} />
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}15` }}
                  >
                    {CATEGORY_ICONS[expense.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{expense.title}</p>
                    <p className="text-xs text-slate-400">{formatDate(expense.date)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 flex-shrink-0">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Top Categories</h3>
            <p className="text-xs text-slate-500 mt-0.5">Spending by category</p>
          </div>
          {!analytics || analytics.categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-slate-500 text-sm">No data yet</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {analytics.categoryData.slice(0, 5).map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[cat.category]}</span>
                      <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[cat.category],
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{cat.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
