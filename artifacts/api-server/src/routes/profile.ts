import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { studentProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Set up multer for profile photo uploads
const uploadDir = "./uploads/photos";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user!.userId}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Compute completion percentage based on filled fields
function computeCompletion(profile: Record<string, unknown>): number {
  const fields = [
    // Step 1
    "dateOfBirth", "gender", "city", "state",
    // Step 2
    "educationLevel", "board", "schoolCollege", "gradePercentage", "stream",
    // Step 3
    "interests", "strengths", "hobbies", "energizedBy",
    // Step 4
    "dreamCareer", "targetColleges", "openToAbroad", "biggestConcern",
    // Step 5
    "familyIncome", "parentsEducation", "familyPressure", "educationBudget",
    // Step 6
    "fiveYearGoal", "alreadyTried", "stoppingYou", "heardFrom",
  ];
  const filled = fields.filter(
    (f) => profile[f] !== null && profile[f] !== undefined && profile[f] !== ""
  ).length;
  return Math.round((filled / fields.length) * 100);
}

// GET /profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, req.user!.userId));

    if (!profile) {
      // Return empty profile
      res.json(null);
      return;
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /profile
router.patch("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const updates = req.body;

    // Check if profile exists
    const [existing] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, userId));

    let profile;
    if (existing) {
      const merged = { ...existing, ...updates };
      const completionPercent = computeCompletion(merged);
      [profile] = await db
        .update(studentProfilesTable)
        .set({ ...updates, completionPercent, updatedAt: new Date() })
        .where(eq(studentProfilesTable.userId, userId))
        .returning();
    } else {
      const completionPercent = computeCompletion(updates);
      [profile] = await db
        .insert(studentProfilesTable)
        .values({ userId, ...updates, completionPercent })
        .returning();
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /profile/photo
router.post("/photo", requireAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const photoUrl = `/uploads/photos/${req.file.filename}`;
    const userId = req.user!.userId;

    const [existing] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, userId));

    if (existing) {
      await db
        .update(studentProfilesTable)
        .set({ photoUrl, updatedAt: new Date() })
        .where(eq(studentProfilesTable.userId, userId));
    } else {
      await db
        .insert(studentProfilesTable)
        .values({ userId, photoUrl, completionPercent: 0 });
    }

    res.json({ photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
