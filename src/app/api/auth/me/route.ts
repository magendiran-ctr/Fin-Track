import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

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

    if (!/^[0-9a-fA-F]{24}$/.test(payload.userId)) {
      return NextResponse.json(
        {
          error: "Invalid session",
          details: "Your session contains an invalid user ID format. Please logout and login again.",
        },
        { status: 401 }
      );
    }

    const user = await db.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        User_id: user.User_id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
