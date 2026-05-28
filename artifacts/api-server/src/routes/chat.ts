import { Router } from "express";
import { db, pool } from "@workspace/db";
import { studentProfilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

async function ensureChatTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

function buildSystemPrompt(user: { name: string }, profile: Record<string, unknown> | null): string {
  const p = profile || {};
  return `You are Menti, MentoraLM's expert AI career counsellor for Indian students. You have deep knowledge of Indian education systems (CBSE, ICSE, IB, state boards), entrance exams (JEE, NEET, CLAT, CUET, CAT, UPSC, NDA, NID, CEED, etc.), top Indian colleges (IITs, NITs, AIIMS, NLUs, IIMs, NIFT, etc.), and career paths.

You are warm, encouraging, specific, and practical. You never give generic advice. You always reference the student's actual profile in your responses.

Student Profile:
Name: ${user.name}
Education Stage: ${p.educationLevel || "Not specified"}
Board: ${p.board || "Not specified"}
Stream: ${p.stream || "Not specified"}
School/College: ${p.schoolCollege || "Not specified"}
Grades: ${p.gradePercentage || "Not specified"}
Subject Strengths: ${p.subjectStrengths || "Not specified"}
Entrance Exams Appeared: ${p.entranceExams || "Not specified"}
Entrance Scores: ${p.entranceScores || "Not specified"}
City: ${p.city || "Not specified"}
State: ${p.state || "Not specified"}
Achievements: ${p.achievements || "Not specified"}
Work Style: ${p.workStyle || "Not specified"}
Thinking Style: ${p.thinkingStyle || "Not specified"}
Energy Type: ${p.energyType || "Not specified"}
Interests: ${p.interests || "Not specified"}
Strengths: ${p.strengths || "Not specified"}
Hobbies: ${p.hobbies || "Not specified"}
Free Time Activity: ${p.freeTimeActivity || "Not specified"}
Dream Career: ${p.dreamCareer || "Not specified"}
Target Colleges: ${p.targetColleges || "Not specified"}
Open to Abroad: ${p.openToAbroad || "Not specified"}
Career Clarity: ${p.careerClarity || "Not specified"}
Decision Timeline: ${p.decisionTimeline || "Not specified"}
Family Income: ${p.familyIncome || "Not specified"}
Parents' Education: ${p.parentsEducation || "Not specified"}
Family Say in Career: ${p.familyPressure || "Not specified"}
Family's Career Expectation: ${p.familyCareerExpectation || "Not specified"}
Education Budget: ${p.educationBudget || "Not specified"}
5-Year Goal: ${p.fiveYearGoal || "Not specified"}
Steps Already Taken: ${p.alreadyTried || "Not specified"}
Obstacles: ${p.obstacles || "Not specified"}
Stress Level (1-5): ${p.stressLevel || "Not specified"}

Rules:
1. Always address the student by their first name
2. Reference their specific profile details in answers
3. Be specific — name actual exams, colleges, timelines relevant to them
4. When a question requires deep personalised mentoring or emotional support, acknowledge it and say: "For this, a 1-on-1 session with our expert counsellor would give you a much more in-depth answer. [Book a Session]"
5. Keep responses concise and scannable (use bullet points when listing steps)
6. Never make up statistics. If unsure, say so.
7. Maintain context within the conversation.
8. Take into account their stress level and obstacles when framing advice — be especially warm and encouraging if stress level is 4 or 5.`;
}

// GET /chat/messages
router.get("/messages", requireAuth, async (req, res) => {
  try {
    await ensureChatTable();
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await pool.query(
      `SELECT id, user_id as "userId", role, content, created_at as "createdAt"
       FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT $2`,
      [req.user!.userId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /chat/stream — SSE streaming
router.post("/stream", requireAuth, async (req, res) => {
  try {
    await ensureChatTable();
    const { content } = req.body;
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "content required" });
      return;
    }

    const userId = req.user!.userId;

    // Rate limit: max 20 messages per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM chat_messages WHERE user_id = $1 AND role = 'user' AND created_at >= $2`,
      [userId, today]
    );
    const todayCount = parseInt(countResult.rows[0].count);
    if (todayCount >= 20) {
      res.status(429).json({ error: "Daily limit of 20 messages reached. Try again tomorrow." });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, userId));

    await pool.query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`,
      [userId, content]
    );

    const historyResult = await pool.query(
      `SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    const history = historyResult.rows.reverse();

    const chatMessages = history.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let fullResponse = "";

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: buildSystemPrompt(user, profile as unknown as Record<string, unknown>),
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    await pool.query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'assistant', $2)`,
      [userId, fullResponse]
    );

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

// POST /chat/new
router.post("/new", requireAuth, async (req, res) => {
  try {
    await ensureChatTable();
    await pool.query(`DELETE FROM chat_messages WHERE user_id = $1`, [req.user!.userId]);
    res.json({ message: "New chat session started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
