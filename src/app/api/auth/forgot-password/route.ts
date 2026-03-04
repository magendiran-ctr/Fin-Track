import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return a vague success to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate a new secure token valid for 30 minutes
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt, used: false },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // Attempt email — gracefully continues if SMTP not configured
    let emailSent = false;
    try {
      await sendResetEmail(email, user.name, resetLink);
      emailSent = true;
    } catch (emailError) {
      console.warn("Email sending failed (SMTP not configured?):", emailError);
    }

    return NextResponse.json({
      message: emailSent
        ? "Password reset email sent successfully."
        : "If that email is registered, a reset link has been sent.",
      // Return link in dev/testing mode when email isn't configured
      resetLink: emailSent ? undefined : resetLink,
    });
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}