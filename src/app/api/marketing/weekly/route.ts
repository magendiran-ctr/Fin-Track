import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWeeklyPromoEmail } from "@/lib/email";

function isAuthorized(req: Request): boolean {
  const secret = process.env.WEEKLY_MAIL_SECRET || process.env.CRON_SECRET;
  if (!secret) return true;

  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  return token === secret || cronHeader === secret;
}

async function runWeeklyCampaign(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const results = await Promise.allSettled(
      users.map((user) => sendWeeklyPromoEmail(user.email, user.name))
    );

    const failedEmails: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        failedEmails.push(users[index].email);
      }
    });

    const sent = users.length - failedEmails.length;

    return NextResponse.json({
      message: "Weekly marketing emails processed.",
      total: users.length,
      sent,
      failed: failedEmails.length,
      failedEmails,
    });
  } catch (error) {
    console.error("Error sending weekly marketing emails:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return runWeeklyCampaign(req);
}

export async function POST(req: Request) {
  return runWeeklyCampaign(req);
}
