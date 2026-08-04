import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  const chats = await prisma.chatMessage.findMany({
    where: {
      OR: [{ senderId: Number(user.id) }, { receiverId: Number(user.id) }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, email: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return res.json({ success: true, data: chats });
});

router.post("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { receiverId, text } = req.body ?? {};

  if (!receiverId || !text) {
    return res.status(400).json({
      success: false,
      message: "Receiver and message text are required",
    });
  }

  const message = await prisma.chatMessage.create({
    data: {
      senderId: Number(user.id),
      receiverId: Number(receiverId),
      text: String(text).trim(),
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, email: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

export default router;
