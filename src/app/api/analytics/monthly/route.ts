// GET /api/analytics/monthly - Get monthly analytics for authenticated user

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { calculateAnalytics } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Defensive check: Ensure userId is a valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(payload.userId)) {
      console.error("Invalid User ID format in token (Analytics):", payload.userId);
      return NextResponse.json(
        {
          error: "Invalid session",
          details: "Your session contains an invalid user ID format. Please logout and login again."
        },
        { status: 401 }
      );
    }

    const expenses = await db.getExpensesByUserId(payload.userId);
    const analytics = calculateAnalytics(expenses);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
