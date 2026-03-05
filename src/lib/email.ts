import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const MAIL_FROM = process.env.MAIL_FROM?.trim() || "FinTrack <fintrackexpense@gmail.com>";

export async function sendResetEmail(to: string, userName: string, resetLink: string) {
  const host = process.env.MAIL_HOST?.trim();
  const port = process.env.MAIL_PORT?.trim();
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASSWORD?.trim();

  const hasPlaceholders =
    !user ||
    !pass ||
    user.includes("your-email@gmail.com") ||
    pass.includes("your-app-password-here");

  if (!host || !port || hasPlaceholders) {
    throw new Error("SMTP is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASSWORD.");
  }

  const safeName = userName?.trim() || "there";

  const mailOptions = {
    from: MAIL_FROM,
    to,
    subject: "Reset Your FinTrack Password",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);padding:36px 40px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Fin</span><span style="font-size:20px;font-weight:800;color:#d1fae5;">Track</span>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;color:#d1fae5;font-size:14px;">Your personal finance companion</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">Reset Your Password</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;">Hi ${safeName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                We received a request to reset your <strong style="color:#0f172a;">FinTrack</strong> password.
                Click the button below to create a new password. This link is valid for <strong>30 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);border-radius:10px;">
                    <a href="${resetLink}" target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
                      Reset My Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="font-size:13px;color:#94a3b8;margin:0 0 8px;">If the button doesn't work, copy and paste this link:</p>
              <p style="font-size:12px;color:#10b981;word-break:break-all;margin:0 0 32px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;">
                <a href="${resetLink}" style="color:#10b981;text-decoration:none;">${resetLink}</a>
              </p>

              <!-- Security Note -->
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#fef9ec;border:1px solid #fde68a;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                      🔒 <strong>Security notice:</strong> This link expires in 30 minutes.
                      If you didn't request a password reset, you can safely ignore this email — your account is still secure.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;">
              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} FinTrack. All rights reserved.<br/>
                Need help? Email us at
                <a href="mailto:support@fintrack.com" style="color:#10b981;text-decoration:none;">support@fintrack.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(to: string, userName: string) {
  const host = process.env.MAIL_HOST?.trim();
  const port = process.env.MAIL_PORT?.trim();
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASSWORD?.trim();

  const hasPlaceholders =
    !user ||
    !pass ||
    user.includes("your-email@gmail.com") ||
    pass.includes("your-app-password-here");

  if (!host || !port || hasPlaceholders) {
    throw new Error("SMTP is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASSWORD.");
  }

  const safeName = userName?.trim() || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${appUrl}/dashboard-logo.svg`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Welcome to Fin-Track, " + safeName + "!",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Fin-Track</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);padding:24px 34px;color:#ffffff;">
              <img src="${logoUrl}" alt="Fin-Track" width="180" style="display:block;max-width:100%;height:auto;" />
              <p style="margin:12px 0 0;color:#d1fae5;font-size:14px;">Welcome to smarter money tracking</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 34px;">
              <h1 style="margin:0 0 12px;font-size:24px;color:#0f172a;">Welcome, ${safeName}!</h1>
              <p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">
                Your Fin-Track account is now active. You can start adding expenses, view analytics, and build better money habits from today.
              </p>
              <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
                As a new user, check out our Pro features and exclusive onboarding offers.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);border-radius:10px;">
                    <a href="${appUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Open Fin-Track
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                You are receiving this welcome email because you created a Fin-Track account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
  });
}

export async function sendWeeklyPromoEmail(to: string, userName: string) {
  const host = process.env.MAIL_HOST?.trim();
  const port = process.env.MAIL_PORT?.trim();
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASSWORD?.trim();

  const hasPlaceholders =
    !user ||
    !pass ||
    user.includes("your-email@gmail.com") ||
    pass.includes("your-app-password-here");

  if (!host || !port || hasPlaceholders) {
    throw new Error("SMTP is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASSWORD.");
  }

  const safeName = userName?.trim() || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${appUrl}/dashboard-logo.svg`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "FinTrack Pro is FREE for 3 Months - Limited Offer",
    html: `
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
</html>
`,
  });
}
