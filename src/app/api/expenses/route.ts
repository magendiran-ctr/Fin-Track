// GET /api/expenses - Get all expenses for authenticated user
// POST /api/expenses - Create a new expense

import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { validateExpenseInput } from "@/lib/utils";
import { Expense, ExpenseCategory } from "@/lib/types";
import { sendExpenseCreatedEmail } from "@/lib/email";

// Middleware helper to authenticate requests
async function authenticate(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get("authorization"));
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request: NextRequest) {
  console.log("GET /api/expenses - Request received");
  try {
    const payload = await authenticate(request);
    console.log("Auth payload:", payload);
    if (!payload) {
      console.log("Unauthorized: No payload");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    console.log("Query params:", { category, startDate, endDate, search });

    let expenses = [];

    // Defensive check: Ensure userId is a valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(payload.userId)) {
      console.error("Invalid User ID format in token (GET):", payload.userId);
      return NextResponse.json(
        {
          error: "Invalid session",
          details: "Your session contains an invalid user ID format. Please logout and login again."
        },
        { status: 401 }
      );
    }

    expenses = await db.getExpensesByUserId(payload.userId);
    console.log(`Found ${expenses.length} expenses for user ${payload.userId}`);

    // Apply filters
    if (category && category !== "All") {
      expenses = expenses.filter((e) => e.category === category);
    }
    if (startDate) {
      expenses = expenses.filter((e) => e.date.split('T')[0] >= startDate);
    }
    if (endDate) {
      expenses = expenses.filter((e) => e.date.split('T')[0] <= endDate);
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

    console.log(`Returning ${expenses.length} filtered expenses`);
    return NextResponse.json({ expenses });
  } catch (error: any) {
    console.error("Get expenses CRITICAL error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/expenses - Request received");
  try {
    const payload = await authenticate(request);.0
    console.log("Auth payload:", payload);
    if (!payload) {
      console.log("Unauthorized: No payload");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Defensive check: Ensure userId is a valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(payload.userId)) {
      console.error("Invalid User ID format in token:", payload.userId);
      return NextResponse.json(
        {
          error: "Invalid session",
          details: "Your session contains an invalid user ID. Please logout and login again."
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    const validationError = validateExpenseInput(body);
    if (validationError) {
      console.log("Validation error:", validationError);
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

    console.log("Prepared expense object:", expense);

    console.log("Calling db.createExpense...");
    const createdExpense = await db.createExpense(expense);
    console.log("Expense created successfully with ID:", createdExpense.id);

    if (process.env.ENABLE_EXPENSE_NOTIFICATIONS === "true") {
      try {
        const user = await db.getUserById(payload.userId);
        if (user?.email) {
          await sendExpenseCreatedEmail(user.email, user.name, createdExpense);
        }
      } catch (notificationError: any) {
        console.error("Expense notification email failed:", notificationError?.message || notificationError);
      }
    }

    return NextResponse.json({ expense: createdExpense }, { status: 201 });
  } catch (error: any) {
    console.error("Create expense CRITICAL error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
