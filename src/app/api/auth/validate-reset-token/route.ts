import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false, reason: "No token provided" }, { status: 400 });
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: { select: { email: true, name: true } } },
        });

        if (!resetToken) {
            return NextResponse.json({ valid: false, reason: "Invalid reset link." });
        }

        if (resetToken.used) {
            return NextResponse.json({ valid: false, reason: "This reset link has already been used." });
        }

        if (new Date() > resetToken.expiresAt) {
            return NextResponse.json({ valid: false, reason: "This reset link has expired." });
        }

        return NextResponse.json({
            valid: true,
            email: resetToken.user.email,
            name: resetToken.user.name,
        });
    } catch (error) {
        console.error("Error in validate-reset-token API:", error);
        return NextResponse.json({ valid: false, reason: "Internal server error" }, { status: 500 });
    }
}
