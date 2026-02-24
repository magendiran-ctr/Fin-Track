// Utility functions for the expense tracker

import { Expense, MonthlyAnalytics, CategoryAnalytics, AnalyticsSummary, ExpenseCategory, EXPENSE_CATEGORIES } from "./types";

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format month for display
export function formatMonth(monthString: string): string {
  const [year, month] = monthString.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

// Get current month string (YYYY-MM)
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Get month string from date
export function getMonthFromDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Calculate analytics from expenses
export function calculateAnalytics(expenses: Expense[]): AnalyticsSummary {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.length;
  const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

  // Monthly data - last 12 months
  const monthlyMap = new Map<string, { total: number; count: number }>();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(monthKey, { total: 0, count: 0 });
  }

  expenses.forEach((expense) => {
    const month = getMonthFromDate(expense.date);
    const existing = monthlyMap.get(month) || { total: 0, count: 0 };
    monthlyMap.set(month, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    });
  });

  const monthlyData: MonthlyAnalytics[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Category data
  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();

  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
    categoryMap.set(expense.category, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    });
  });

  const categoryData: CategoryAnalytics[] = EXPENSE_CATEGORIES
    .filter((cat) => categoryMap.has(cat))
    .map((category) => {
      const data = categoryMap.get(category)!;
      return {
        category,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Top category
  const topCategory = categoryData.length > 0 ? categoryData[0].category : null;

  return {
    totalExpenses,
    totalAmount,
    averageExpense,
    topCategory,
    monthlyData,
    categoryData,
  };
}

// Export expenses to CSV
export function exportToCSV(expenses: Expense[]): string {
  const headers = ["Date", "Title", "Category", "Amount", "Notes"];
  const rows = expenses.map((e) => [
    e.date,
    `"${e.title.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
    `"${(e.notes || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// Validate expense input
export function validateExpenseInput(data: {
  title?: unknown;
  amount?: unknown;
  category?: unknown;
  date?: unknown;
}): string | null {
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    return "Title is required";
  }
  if (data.title.length > 100) {
    return "Title must be less than 100 characters";
  }
  if (data.amount === undefined || data.amount === null) {
    return "Amount is required";
  }
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    return "Amount must be a positive number";
  }
  if (amount > 1000000) {
    return "Amount is too large";
  }
  if (!data.category || !EXPENSE_CATEGORIES.includes(data.category as ExpenseCategory)) {
    return "Invalid category";
  }
  if (!data.date || typeof data.date !== "string") {
    return "Date is required";
  }
  const dateObj = new Date(data.date);
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  return null;
}
