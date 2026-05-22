import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db";

const router = Router();

// POST /contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "name, email, and message are required" });
      return;
    }

    await db.insert(contactMessagesTable).values({ name, email, message });
    res.status(201).json({ message: "Your message has been received. We'll be in touch!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
