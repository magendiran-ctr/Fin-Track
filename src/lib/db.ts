// Database service using Prisma and MongoDB
import prisma from "./prisma";
import { User, Expense } from "./types";

export class Database {
  // User operations
  async createUser(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        id: undefined, // Prisma handles ID for MongoDB @db.ObjectId
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: new Date(user.createdAt),
      },
    });
    return {
      ...user,
      id: createdUser.id,
    };
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return undefined;
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return undefined;
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // Expense operations
  async createExpense(expense: Expense): Promise<Expense> {
    const createdExpense = await prisma.expense.create({
      data: {
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date),
        notes: expense.notes,
        userId: expense.userId,
      },
    });
    return {
      ...expense,
      id: createdExpense.id,
      createdAt: createdExpense.createdAt.toISOString(),
      updatedAt: createdExpense.updatedAt.toISOString(),
    };
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });
    if (!expense) return undefined;
    return {
      ...expense,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    } as Expense;
  }

  async getExpensesByUserId(userId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return expenses.map((e: any) => ({
      ...e,
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })) as Expense[];
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | undefined> {
    const data: any = { ...updates };
    if (updates.date) data.date = new Date(updates.date);

    const updated = await prisma.expense.update({
      where: { id },
      data,
    });
    return {
      ...updated,
      date: updated.date.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    } as Expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    try {
      await prisma.expense.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new Database();

// Generate unique IDs (kept for backward compatibility if needed, though Prisma handles IDs)
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
