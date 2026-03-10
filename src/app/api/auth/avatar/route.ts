import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

async function authenticate(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get("authorization"));
  if (!token) return null;
  return await verifyToken(token);
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await authenticate(request);
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

    const body = await request.json();
    const avatar = body?.avatar;

    if (!avatar || typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
      return NextResponse.json({ error: "Valid avatar image is required" }, { status: 400 });
    }

    // Prevent oversized payloads from being stored in MongoDB.
    if (avatar.length > 3_000_000) {
      return NextResponse.json({ error: "Avatar image is too large" }, { status: 413 });
    }

    const updatedUser = await db.updateUserAvatar(payload.userId, avatar);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        User_id: updatedUser.User_id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar || null,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
