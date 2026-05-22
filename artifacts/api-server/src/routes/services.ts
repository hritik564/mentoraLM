import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /services — public, published only
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = db.select().from(servicesTable).where(eq(servicesTable.status, "PUBLISHED"));
    const results = await query;
    const filtered = category
      ? results.filter((s) => s.category === category)
      : results;
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /services/:id — public
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [service] = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.id, id));
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

// GET /services/:id/slots — public
router.get("/:id/slots", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [service] = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.id, id));
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    const slots = JSON.parse(service.slots || "[]");
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
