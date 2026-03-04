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
    let emailErrorMsg = "";
    try {
      await sendResetEmail(normalizedEmail, user.name, resetLink);
      emailSent = true;
    } catch (emailError: any) {
      emailErrorMsg = emailError.message || "Unknown error";
      console.warn("--- RESET EMAIL FAILURE REPORT ---");
      console.warn(`To: ${normalizedEmail}`);
      console.warn(`Reset Link: ${resetLink}`);
      console.warn(`Error: ${emailErrorMsg}`);
      console.warn("---------------------------------");

      if (!isDev) {
        // In production, we don't leak the error but we log it
        console.error("Email sending failed:", emailError);
      }
    }

    if (isDev && !emailSent) {
      return NextResponse.json({
        message: "Dev Mode: Email failed but reset link is below.",
        resetLink: resetLink,
        debug: {
          error: emailErrorMsg,
          hint: "Check MAIL_USER / MAIL_PASSWORD in .env. See .env.example for setup instructions."
        }
      });
    }

    return NextResponse.json({
      message: emailSent
        ? "Password reset email sent successfully."
        : "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
