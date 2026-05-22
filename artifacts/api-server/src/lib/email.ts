import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_USER || "noreply@mentoralm.com";

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.SMTP_USER) return; // Skip if not configured
  try {
    await transporter.sendMail({
      from: `MentoraLM <${FROM}>`,
      to,
      subject: "Welcome to MentoraLM! 🎯",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #1A1AFF; margin-bottom: 16px;">Welcome to MentoraLM, ${name}!</h1>
          <p style="color: #8888AA; font-size: 16px; line-height: 1.6;">
            Your AI career counsellor is ready. Start by completing your profile — the more we know about you, the better we can guide you.
          </p>
          <a href="https://mentoralm.com/onboarding" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: linear-gradient(135deg, #1A1AFF, #0000CC); color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600;">
            Complete Your Profile →
          </a>
          <p style="color: #8888AA; margin-top: 32px; font-size: 14px;">© 2025 MentoraLM</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

export async function sendOtpEmail(to: string, otp: string) {
  if (!process.env.SMTP_USER) return;
  try {
    await transporter.sendMail({
      from: `MentoraLM <${FROM}>`,
      to,
      subject: "Your MentoraLM Password Reset OTP",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #1A1AFF;">Password Reset OTP</h1>
          <p style="color: #8888AA;">Your OTP is valid for 10 minutes:</p>
          <div style="font-size: 48px; font-weight: 700; color: #FF5C00; letter-spacing: 12px; margin: 24px 0;">${otp}</div>
          <p style="color: #8888AA; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err);
  }
}

export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  serviceTitle: string,
  slotDateTime: string
) {
  if (!process.env.SMTP_USER) return;
  try {
    await transporter.sendMail({
      from: `MentoraLM <${FROM}>`,
      to,
      subject: `Booking Confirmed: ${serviceTitle}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #1A1AFF;">Booking Confirmed! 🎉</h1>
          <p style="color: #8888AA;">Hi ${name}, your session has been confirmed.</p>
          <div style="background: #13131A; border: 1px solid #22223A; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="color: #fff; font-size: 18px; font-weight: 600; margin: 0 0 8px;">${serviceTitle}</p>
            <p style="color: #8888AA; margin: 0;">📅 ${new Date(slotDateTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          </div>
          <p style="color: #8888AA; font-size: 14px;">© 2025 MentoraLM</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }
}
