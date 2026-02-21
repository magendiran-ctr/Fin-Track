// PUT /api/expenses/:id - Update an expense
// DELETE /api/expenses/:id - Delete an expense

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { validateExpenseInput } from "@/lib/utils";
import { ExpenseCategory } from "@/lib/types";

async function authenticate(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get("authorization"));
  if (!token) return null;
  return await verifyToken(token);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const expense = db.getExpenseById(id);

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Ensure user owns this expense
    if (expense.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationError = validateExpenseInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updated = db.updateExpense(id, {
      title: body.title.trim(),
      amount: Number(body.amount),
      category: body.category as ExpenseCategory,
      date: body.date,
      notes: body.notes?.trim() || undefined,
    });

    return NextResponse.json({ expense: updated });
  } catch (error) {
    console.error("Update expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const expense = db.getExpenseById(id);

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Ensure user owns this expense
    if (expense.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    db.deleteExpense(id);

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
