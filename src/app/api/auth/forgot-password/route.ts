import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return a vague success to prevent user enumeration.
    if (!user) {
      return NextResponse.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt, used: false },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    const isDev = process.env.NODE_ENV !== "production";

    let emailSent = false;
    try {
      await sendResetEmail(normalizedEmail, user.name, resetLink);
      emailSent = true;
    } catch (emailError) {
      console.warn("Email sending failed:", emailError);
      if (isDev) {
        return NextResponse.json(
          { message: "Reset email could not be sent. Check MAIL_USER / MAIL_PASSWORD in .env." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: emailSent
        ? "Password reset email sent successfully."
        : "If that email is registered, a reset link has been sent.",
      // Keep dev fallback for local testing only when email fails.
      resetLink: !emailSent && isDev ? resetLink : undefined,
    });
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
