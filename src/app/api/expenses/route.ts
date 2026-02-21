// GET /api/expenses - Get all expenses for authenticated user
// POST /api/expenses - Create a new expense

import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { validateExpenseInput } from "@/lib/utils";
import { Expense, ExpenseCategory } from "@/lib/types";

// Middleware helper to authenticate requests
async function authenticate(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get("authorization"));
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    let expenses = db.getExpensesByUserId(payload.userId);

    // Apply filters
    if (category && category !== "All") {
      expenses = expenses.filter((e) => e.category === category);
    }
    if (startDate) {
      expenses = expenses.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      expenses = expenses.filter((e) => e.date <= endDate);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      expenses = expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.category.toLowerCase().includes(searchLower) ||
          (e.notes && e.notes.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationError = validateExpenseInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const expense: Expense = {
      id: generateId(),
      userId: payload.userId,
      title: body.title.trim(),
      amount: Number(body.amount),
      category: body.category as ExpenseCategory,
      date: body.date,
      notes: body.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createExpense(expense);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
