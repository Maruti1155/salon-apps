import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  const notifications = await prisma.notification.findMany({
    where: { userId: Number(user.id) },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ success: true, data: notifications });
});

router.post("/", authMiddleware, async (req, res) => {
  const { userId, title, message, type } = req.body ?? {};

  if (!userId || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "userId, title and message are required",
    });
  }

  const notification = await prisma.notification.create({
    data: {
      userId: Number(userId),
      title: String(title).trim(),
      message: String(message).trim(),
      type: type ? String(type).trim() : "info",
    },
  });

  return res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: notification,
  });
});

export default router;
