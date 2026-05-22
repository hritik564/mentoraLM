import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { db } from "@workspace/db";
import { bookingsTable, servicesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { sendBookingConfirmationEmail } from "../lib/email.js";

const router = Router();

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// POST /bookings
router.post("/", requireAuth, async (req, res) => {
  try {
    const { serviceId, slotDateTime } = req.body;
    if (!serviceId || !slotDateTime) {
      res.status(400).json({ error: "serviceId and slotDateTime required" });
      return;
    }

    const [service] = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.id, parseInt(serviceId)));
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    const existingBookings = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.userId, req.user!.userId),
          eq(bookingsTable.serviceId, service.id),
          eq(bookingsTable.status, "UPCOMING")
        )
      );
    if (existingBookings.length > 0) {
      res.status(400).json({ error: "You already have an active booking for this session." });
      return;
    }

    const amount = service.price * 100; // Razorpay expects paise
    const razorpay = getRazorpayInstance();

    let razorpayOrderId = `mock_order_${Date.now()}`;
    if (razorpay) {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      razorpayOrderId = order.id;
    }

    const [booking] = await db
      .insert(bookingsTable)
      .values({
        userId: req.user!.userId,
        serviceId: service.id,
        slotDateTime,
        paymentStatus: "PENDING",
        razorpayOrderId,
        amount: service.price,
        status: "UPCOMING",
      })
      .returning();

    res.status(201).json({
      bookingId: booking.id,
      razorpayOrderId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      amount: service.price,
      currency: "INR",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /bookings/verify
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpaySignature) {
      const expectedSig = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
      if (expectedSig !== razorpaySignature) {
        res.status(400).json({ error: "Invalid payment signature" });
        return;
      }
    }

    const [booking] = await db
      .update(bookingsTable)
      .set({
        paymentStatus: "PAID",
        razorpayPaymentId,
        status: "UPCOMING",
      })
      .where(eq(bookingsTable.id, parseInt(bookingId)))
      .returning();

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Send confirmation email
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId));
    const [service] = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.id, booking.serviceId));
    if (user && service) {
      sendBookingConfirmationEmail(user.email, user.name, service.title, booking.slotDateTime).catch(() => {});
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /bookings/mine
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const bookings = await db
      .select({
        id: bookingsTable.id,
        userId: bookingsTable.userId,
        serviceId: bookingsTable.serviceId,
        slotDateTime: bookingsTable.slotDateTime,
        paymentStatus: bookingsTable.paymentStatus,
        razorpayOrderId: bookingsTable.razorpayOrderId,
        razorpayPaymentId: bookingsTable.razorpayPaymentId,
        amount: bookingsTable.amount,
        status: bookingsTable.status,
        createdAt: bookingsTable.createdAt,
        service: servicesTable,
      })
      .from(bookingsTable)
      .leftJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
      .where(eq(bookingsTable.userId, req.user!.userId));

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
