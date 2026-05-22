import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@workspace/db";
import {
  usersTable,
  refreshTokensTable,
  otpCodesTable,
} from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  REFRESH_TOKEN_EXPIRES_MS,
} from "../lib/jwt.js";
import { sendWelcomeEmail, sendOtpEmail } from "../lib/email.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ name, email: email.toLowerCase(), phone, passwordHash, role: "STUDENT" })
      .returning();

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await db.insert(refreshTokensTable).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRES_MS,
    });

    sendWelcomeEmail(user.email, user.name).catch(() => {});

    const { passwordHash: _, ...userPublic } = user;
    res.status(201).json({ accessToken, user: userPublic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await db.insert(refreshTokensTable).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRES_MS,
    });

    const { passwordHash: _, ...userPublic } = user;
    res.status(200).json({ accessToken, user: userPublic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/signout
router.post("/signout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await db
        .update(refreshTokensTable)
        .set({ revoked: true })
        .where(eq(refreshTokensTable.token, token));
    }
    res.clearCookie("refreshToken");
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    const [stored] = await db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.token, token),
          eq(refreshTokensTable.revoked, false),
          gt(refreshTokensTable.expiresAt, new Date())
        )
      );

    if (!stored) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const payload = verifyToken(token);
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    // Always return success to prevent email enumeration
    if (user) {
      const otp = crypto.randomInt(100000, 999999).toString();
      await db.insert(otpCodesTable).values({
        email: email.toLowerCase(),
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      });
      sendOtpEmail(email, otp).catch(() => {});
    }

    res.json({ message: "If that email exists, an OTP has been sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ error: "All fields required" });
      return;
    }

    const [record] = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.email, email.toLowerCase()),
          eq(otpCodesTable.code, otp),
          eq(otpCodesTable.used, false),
          gt(otpCodesTable.expiresAt, new Date())
        )
      );

    if (!record) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.email, email.toLowerCase()));

    await db
      .update(otpCodesTable)
      .set({ used: true })
      .where(eq(otpCodesTable.id, record.id));

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { passwordHash: _, ...userPublic } = user;
    res.json(userPublic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
