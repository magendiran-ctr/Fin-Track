const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const prisma = new PrismaClient();

function validateSmtp() {
  const host = process.env.MAIL_HOST?.trim();
  const port = process.env.MAIL_PORT?.trim();
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASSWORD?.trim();

  if (!host || !port || !user || !pass) {
    throw new Error("Missing SMTP env vars. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD.");
  }
}

function buildHtml(name, appUrl) {
  const safeName = (name || "there").trim();
  const logoUrl = `${appUrl}/fintrack-logo.svg`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FinTrack Weekly</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);padding:24px 34px;color:#ffffff;">
              <img src="${logoUrl}" alt="FinTrack" width="180" style="display:block;max-width:100%;height:auto;" />
              <p style="margin:12px 0 0;color:#d1fae5;font-size:14px;">Your weekly finance boost</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 34px;">
              <p style="margin:0 0 14px;color:#334155;font-size:15px;">Hi ${safeName},</p>
              <h2 style="margin:0 0 10px;font-size:24px;color:#0f172a;line-height:1.2;">
                Get <span style="color:#0d9488;">FinTrack Pro FREE for 3 months</span>
              </h2>
              <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
                Unlock premium insights, faster reports, and smarter budget controls at no cost for the first 3 months.
                This is a limited-time offer for selected FinTrack users.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;background:#ecfeff;border:1px solid #a5f3fc;border-radius:10px;">
                <tr>
                  <td style="padding:12px 14px;color:#0f172a;font-size:13px;line-height:1.6;">
                    <strong>Offer includes:</strong> premium analytics, spending alerts, and enhanced subscription tools.
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);border-radius:10px;">
                    <a href="${appUrl}/?tab=subscription" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Claim Free 3 Months
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                You are receiving this weekly promotional email from FinTrack.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function main() {
  validateSmtp();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const from = process.env.MAIL_FROM || "FinTrack <fintrackexpense@gmail.com>";

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const users = await prisma.user.findMany({
    select: { email: true, name: true },
  });

  if (!users.length) {
    console.log("No users found.");
    return;
  }

  console.log(`Sending weekly promo to ${users.length} users...`);

  const results = await Promise.allSettled(
    users.map((u) =>
      transporter.sendMail({
        from,
        to: u.email,
        subject: "FinTrack Pro is FREE for 3 Months - Limited Offer",
        html: buildHtml(u.name, appUrl),
      })
    )
  );

  let sent = 0;
  let failed = 0;
  const failedEmails = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      sent += 1;
    } else {
      failed += 1;
      failedEmails.push(users[i].email);
    }
  });

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
  if (failedEmails.length) {
    console.log("Failed emails:");
    failedEmails.forEach((e) => console.log(`- ${e}`));
  }
}

main()
  .catch((err) => {
    console.error("Failed to send weekly ads:", err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
