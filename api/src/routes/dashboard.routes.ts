import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", authMiddleware, async (_req, res) => {
  const [customers, appointments, services, revenueResult] = await Promise.all([
    prisma.customer.count(),
    prisma.appointment.count(),
    prisma.service.count(),
    prisma.appointment.aggregate({
      _sum: {
        amount: true,
      },
    }),
  ]);

  const revenue = Number(revenueResult._sum.amount ?? 0);

  return res.json({
    success: true,
    data: {
      customers,
      appointments,
      services,
      revenue,
    },
  });
});

export default router;