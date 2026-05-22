import { Router } from "express";
import { db, pool } from "@workspace/db";
import {
  usersTable,
  studentProfilesTable,
  servicesTable,
  bookingsTable,
  contactMessagesTable,
} from "@workspace/db";
import { eq, and, gte, count, sum, or } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.use(requireAdmin);

// GET /admin/stats
router.get("/stats", async (_req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [studentCount] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.role, "STUDENT"));

    const [activeCount] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(and(eq(usersTable.role, "STUDENT"), gte(usersTable.createdAt, oneWeekAgo)));

    const [revenueResult] = await db
      .select({ total: sum(bookingsTable.amount) })
      .from(bookingsTable)
      .where(or(eq(bookingsTable.status, "COMPLETED"), eq(bookingsTable.paymentStatus, "PAID")));

    const [bookingCount] = await db
      .select({ count: count() })
      .from(bookingsTable)
      .where(gte(bookingsTable.createdAt, startOfMonth));

    res.json({
      totalStudents: studentCount.count,
      activeThisWeek: activeCount.count,
      totalRevenue: Number(revenueResult.total) || 0,
      bookingsThisMonth: bookingCount.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/students
router.get("/students", async (_req, res) => {
  try {
    const students = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        completionPercent: studentProfilesTable.completionPercent,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .leftJoin(studentProfilesTable, eq(usersTable.id, studentProfilesTable.userId))
      .where(eq(usersTable.role, "STUDENT"))
      .orderBy(usersTable.createdAt);

    res.json(
      students.map((s) => ({
        ...s,
        completionPercent: s.completionPercent ?? 0,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/students/:id
router.get("/students/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    const [profile] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, id));

    const { passwordHash: _, ...userPublic } = user;
    res.json({ user: userPublic, profile: profile || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/bookings
router.get("/bookings", async (req, res) => {
  try {
    const { serviceId, status } = req.query;

    const bookings = await db
      .select({
        id: bookingsTable.id,
        userId: bookingsTable.userId,
        studentName: usersTable.name,
        studentEmail: usersTable.email,
        serviceId: bookingsTable.serviceId,
        serviceTitle: servicesTable.title,
        slotDateTime: bookingsTable.slotDateTime,
        paymentStatus: bookingsTable.paymentStatus,
        amount: bookingsTable.amount,
        status: bookingsTable.status,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .leftJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
      .leftJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
      .orderBy(bookingsTable.createdAt);

    const filtered = bookings.filter((b) => {
      if (serviceId && b.serviceId !== parseInt(serviceId as string)) return false;
      if (status && b.status !== status) return false;
      return true;
    });

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/bookings/:id
router.patch("/bookings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ["UPCOMING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, id));

    const [full] = await db
      .select({
        id: bookingsTable.id,
        userId: bookingsTable.userId,
        studentName: usersTable.name,
        studentEmail: usersTable.email,
        serviceId: bookingsTable.serviceId,
        serviceTitle: servicesTable.title,
        slotDateTime: bookingsTable.slotDateTime,
        paymentStatus: bookingsTable.paymentStatus,
        amount: bookingsTable.amount,
        status: bookingsTable.status,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .leftJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
      .leftJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
      .where(eq(bookingsTable.id, id));

    if (!full) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/services
router.post("/services", async (req, res) => {
  try {
    const {
      title, shortDesc, fullDesc, included, category, duration,
      price, counsellorName, counsellorBio, thumbnailUrl, status, slots,
    } = req.body;

    const [service] = await db
      .insert(servicesTable)
      .values({
        title,
        shortDesc,
        fullDesc,
        included: Array.isArray(included) ? JSON.stringify(included) : (included || "[]"),
        category,
        duration,
        price: parseInt(price),
        counsellorName,
        counsellorBio,
        thumbnailUrl,
        status: status || "DRAFT",
        slots: Array.isArray(slots) ? JSON.stringify(slots) : (slots || "[]"),
      })
      .returning();

    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/services/:id
router.patch("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    // Copy scalar fields
    for (const key of ["title", "shortDesc", "fullDesc", "category", "duration", "counsellorName", "counsellorBio", "thumbnailUrl", "status"]) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (body.price !== undefined) updates.price = parseInt(body.price as string);
    if (body.included !== undefined) {
      updates.included = Array.isArray(body.included) ? JSON.stringify(body.included) : body.included;
    }
    if (body.slots !== undefined) {
      updates.slots = Array.isArray(body.slots) ? JSON.stringify(body.slots) : body.slots;
    }

    const [service] = await db
      .update(servicesTable)
      .set(updates as Partial<typeof servicesTable.$inferInsert>)
      .where(eq(servicesTable.id, id))
      .returning();

    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /admin/services/:id
router.delete("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/contacts
router.get("/contacts", async (_req, res) => {
  try {
    await pool.query(`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE`);
    const messages = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(contactMessagesTable.createdAt);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/contacts/:id
router.patch("/contacts/:id", async (req, res) => {
  try {
    await pool.query(`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE`);
    const id = parseInt(req.params.id);
    const { isRead } = req.body;
    const [msg] = await db
      .update(contactMessagesTable)
      .set({ isRead: Boolean(isRead) })
      .where(eq(contactMessagesTable.id, id))
      .returning();
    if (!msg) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/students/:id/chat
router.get("/students/:id/chat", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    const result = await pool.query(
      `SELECT id, role, content, created_at as "createdAt"
       FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 20`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
