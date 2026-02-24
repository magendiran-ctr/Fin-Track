// Types for the Expense Tracker application

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Bills"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#10b981",
  Travel: "#3b82f6",
  Bills: "#f59e0b",
  Shopping: "#8b5cf6",
  Entertainment: "#ec4899",
  Health: "#ef4444",
  Education: "#06b6d4",
  Other: "#6b7280",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: "Utensils",
  Travel: "Plane",
  Bills: "FileText",
  Shopping: "ShoppingBag",
  Entertainment: "Film",
  Health: "Activity",
  Education: "GraduationCap",
  Other: "Box",
};

export interface AuthResponse {
  token: string;
  user: Omit<User, "password">;
}

export interface ApiError {
  error: string;
}

export interface MonthlyAnalytics {
  month: string;
  total: number;
  count: number;
}

export interface CategoryAnalytics {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  topCategory: ExpenseCategory | null;
  monthlyData: MonthlyAnalytics[];
  categoryData: CategoryAnalytics[];
}

export interface ExpenseFilters {
  category?: ExpenseCategory | "All";
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}
