import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import servicesRouter from "./services.js";
import bookingsRouter from "./bookings.js";
import chatRouter from "./chat.js";
import roadmapRouter from "./roadmap.js";
import adminRouter from "./admin.js";
import contactRouter from "./contact.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/services", servicesRouter);
router.use("/bookings", bookingsRouter);
router.use("/chat", chatRouter);
router.use("/roadmap", roadmapRouter);
router.use("/admin", adminRouter);
router.use("/contact", contactRouter);

export default router;
