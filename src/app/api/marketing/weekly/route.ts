import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWeeklyPromoEmail } from "@/lib/email";

function isSmtpConfigured() {
  const host = process.env.MAIL_HOST?.trim();
  const port = process.env.MAIL_PORT?.trim();
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASSWORD?.trim();
  return Boolean(host && port && user && pass);
}

function isAuthorized(req: Request): boolean {
  const secrets = [process.env.WEEKLY_MAIL_SECRET, process.env.CRON_SECRET]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (!secrets.length) return true;

  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim() 
    : "";

  return secrets.some((secret) => token === secret || cronHeader === secret);
}

async function runWeeklyCampaign(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { message: "Email not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD." },
        { status: 500 }
      );
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    if (!users.length) {
      return NextResponse.json({
        message: "No users to send weekly mail.",
        sent: 0,
        failed: 0,
      });
    }

    const results = await Promise.all(
      users.map(async (user) => {
        try {
          await sendWeeklyPromoEmail(user.email, user.name);
          return { email: user.email, ok: true as const };
        } catch (error: any) {
          return {
            email: user.email,
            ok: false as const,
            reason: error?.message || "Unknown error",
          };
        }
      })
    );

    const failures = results.filter((result) => !result.ok);
    const failedEmails = failures.map((result) => result.email);
    const sent = users.length - failures.length;

    return NextResponse.json({
      message: "Weekly marketing emails processed.",
      total: users.length,
      sent,
      failed: failures.length,
      failedEmails,
      failures,
    });
  } catch (error: any) {
    console.error("Error sending weekly marketing emails:", {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return runWeeklyCampaign(req);
}

export async function POST(req: Request) {
  return runWeeklyCampaign(req);
}
