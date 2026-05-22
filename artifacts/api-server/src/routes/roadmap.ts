import { Router } from "express";
import { db } from "@workspace/db";
import { roadmapsTable, studentProfilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

function buildRoadmapPrompt(user: { name: string }, profile: Record<string, unknown>): string {
  return `Generate a detailed, personalised career roadmap for this student. Return ONLY valid JSON matching this exact structure:

{
  "phases": [
    {
      "phase": "Phase 1: Immediate (Next 3 months)",
      "timeframe": "0-3 months",
      "items": ["specific action 1", "specific action 2", ...]
    },
    {
      "phase": "Phase 2: Short-term (3-12 months)",
      "timeframe": "3-12 months",
      "items": ["specific action 1", ...]
    },
    {
      "phase": "Phase 3: Medium-term (1-3 years)",
      "timeframe": "1-3 years",
      "items": ["specific action 1", ...]
    },
    {
      "phase": "Phase 4: Long-term (3-5 years)",
      "timeframe": "3-5 years",
      "items": ["specific action 1", ...]
    }
  ]
}

Student Profile:
Name: ${user.name}
Education Level: ${profile.educationLevel || "Not specified"}
Board: ${profile.board || "Not specified"}
Stream: ${profile.stream || "Not specified"}
Grades: ${profile.gradePercentage || "Not specified"}
City: ${profile.city || "Not specified"}
Interests: ${profile.interests || "Not specified"}
Strengths: ${profile.strengths || "Not specified"}
Dream Career: ${profile.dreamCareer || "Not specified"}
Target Colleges: ${profile.targetColleges || "Not specified"}
Biggest Concern: ${profile.biggestConcern || "Not specified"}
Education Budget: ${profile.educationBudget || "Not specified"}
5-Year Goal: ${profile.fiveYearGoal || "Not specified"}
What's stopping them: ${profile.stoppingYou || "Not specified"}
Already tried: ${profile.alreadyTried || "Not specified"}

Be specific — name actual exams (JEE, NEET, CLAT, etc.), colleges, courses, and timelines relevant to this student. Return only the JSON, no markdown.`;
}

// GET /roadmap
router.get("/", requireAuth, async (req, res) => {
  try {
    const [roadmap] = await db
      .select()
      .from(roadmapsTable)
      .where(eq(roadmapsTable.userId, req.user!.userId));
    if (!roadmap) {
      res.status(404).json({ error: "No roadmap generated yet" });
      return;
    }
    res.json(roadmap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /roadmap/generate
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, userId));

    if (!profile || profile.completionPercent < 50) {
      res.status(400).json({ error: "Please complete at least 50% of your profile first" });
      return;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildRoadmapPrompt(user, profile as unknown as Record<string, unknown>),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(500).json({ error: "Failed to generate roadmap" });
      return;
    }

    // Clean response in case Claude added markdown fences
    let content = textBlock.text.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    // Validate JSON
    JSON.parse(content);

    // Upsert roadmap
    const [existing] = await db
      .select()
      .from(roadmapsTable)
      .where(eq(roadmapsTable.userId, userId));

    let roadmap;
    if (existing) {
      [roadmap] = await db
        .update(roadmapsTable)
        .set({ content, generatedAt: new Date() })
        .where(eq(roadmapsTable.userId, userId))
        .returning();
    } else {
      [roadmap] = await db
        .insert(roadmapsTable)
        .values({ userId, content })
        .returning();
    }

    res.json(roadmap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
