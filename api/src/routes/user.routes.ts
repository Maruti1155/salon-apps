import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  const currentUser = await prisma.user.findUnique({
    where: { id: Number(user.id) },
    include: {
      organization: true,
      parent: true,
      children: true,
    },
  });

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.json({
    success: true,
    data: currentUser,
  });
});

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to view users",
    });
  }

  const users = await prisma.user.findMany({
    where: user.role === "SUPER_ADMIN"
      ? {}
      : { organizationId: user.organizationId ?? undefined },
    include: {
      organization: true,
      parent: true,
      children: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    success: true,
    data: users,
  });
});

export default router;
