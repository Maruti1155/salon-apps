import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const organizationId = user.organizationId ?? null;

  const baseWhere = isSuperAdmin ? {} : { organizationId: organizationId ?? undefined };

  const [customers, appointments, services, revenueResult] = await Promise.all([
    prisma.customer.count({
      where: baseWhere,
    }),
    prisma.appointment.count({
      where: baseWhere,
    }),
    prisma.service.count({
      where: baseWhere,
    }),
    prisma.appointment.aggregate({
      _sum: {
        amount: true,
      },
      where: baseWhere,
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

router.get("/overview", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const organizationId = user.organizationId ?? null;
  const baseWhere = isSuperAdmin ? {} : { organizationId: organizationId ?? undefined };

  const [customers, appointments, services, pendingAppointments, revenueResult] = await Promise.all([
    prisma.customer.count({ where: baseWhere }),
    prisma.appointment.count({ where: baseWhere }),
    prisma.service.count({ where: baseWhere }),
    prisma.appointment.count({
      where: { ...baseWhere, status: "PENDING" },
    }),
    prisma.appointment.aggregate({
      _sum: { amount: true },
      where: baseWhere,
    }),
  ]);

  return res.json({
    success: true,
    data: {
      customers,
      appointments,
      services,
      pendingAppointments,
      revenue: Number(revenueResult._sum.amount ?? 0),
    },
  });
});

export default router;