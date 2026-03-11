import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const name = body?.name;
    const email = body?.email;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const updatedUser = await db.updateUserProfile(payload.userId, {
      name: name.trim(),
      email: email.trim(),
    });

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already in use. Please use a different email." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
