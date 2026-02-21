// In-memory database for the expense tracker
// In production, replace with a real database (PostgreSQL/MongoDB)

import { User, Expense } from "./types";

// Simple in-memory store (persists during server runtime)
class Database {
  private users: Map<string, User> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId

  // User operations
  createUser(user: User): User {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user.id);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    const userId = this.usersByEmail.get(email);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  // Expense operations
  createExpense(expense: Expense): Expense {
    this.expenses.set(expense.id, expense);
    return expense;
  }

  getExpenseById(id: string): Expense | undefined {
    return this.expenses.get(id);
  }

  getExpensesByUserId(userId: string): Expense[] {
    return Array.from(this.expenses.values())
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  updateExpense(id: string, updates: Partial<Expense>): Expense | undefined {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    const updated = { ...expense, ...updates, updatedAt: new Date().toISOString() };
    this.expenses.set(id, updated);
    return updated;
  }

  deleteExpense(id: string): boolean {
    return this.expenses.delete(id);
  }
}

// Singleton instance
const globalDb = global as typeof global & { __db?: Database };
if (!globalDb.__db) {
  globalDb.__db = new Database();
}

export const db = globalDb.__db;

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
