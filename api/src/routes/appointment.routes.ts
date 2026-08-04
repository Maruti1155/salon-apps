import { AppointmentStatus } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  const appointments = await prisma.appointment.findMany({
    where: user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "CUSTOMER"
        ? { customer: { id: Number(user.id) } }
        : { organizationId: user.organizationId ?? undefined },
    include: {
      customer: true,
      service: true,
    },
    orderBy: { appointmentDate: "asc" },
  });

  return res.json({
    success: true,
    data: appointments,
  });
});

router.get("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      service: true,
    },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF") {
    if (appointment.customerId !== Number(user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own appointments",
      });
    }
  }

  if (user.role !== "SUPER_ADMIN" && user.role !== "CUSTOMER" && appointment.organizationId !== user.organizationId) {
    return res.status(403).json({
      success: false,
      message: "You can only access appointments from your salon",
    });
  }

  return res.json({
    success: true,
    data: appointment,
  });
});

router.post("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { customerId, serviceId, appointmentDate, status, amount } = req.body ?? {};

  if (!customerId || !serviceId || !appointmentDate) {
    return res.status(400).json({
      success: false,
      message: "Customer, service, and appointment date are required",
    });
  }

  if (user.role === "CUSTOMER") {
    if (Number(customerId) !== Number(user.id)) {
      return res.status(403).json({
        success: false,
        message: "Customers can only create appointments for themselves",
      });
    }
  }

  const customer = await prisma.customer.findUnique({
    where: { id: Number(customerId) },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  const service = await prisma.service.findUnique({
    where: { id: Number(serviceId) },
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  const validStatuses = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ] as const;

  const normalizedStatus: AppointmentStatus =
    status && typeof status === "string"
      ? validStatuses.includes(status.toUpperCase() as AppointmentStatus)
        ? (status.toUpperCase() as AppointmentStatus)
        : AppointmentStatus.PENDING
      : AppointmentStatus.PENDING;

  const appointment = await prisma.appointment.create({
    data: {
      customerId: Number(customerId),
      serviceId: Number(serviceId),
      organizationId: user.role === "SUPER_ADMIN" ? undefined : user.organizationId ?? service.organizationId ?? customer.organizationId,
      appointmentDate: new Date(appointmentDate),
      status: normalizedStatus,
      amount: amount !== undefined ? Number(amount) : Number(service.price),
    },
    include: {
      customer: true,
      service: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    data: appointment,
  });
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { customerId, serviceId, appointmentDate, status, amount } = req.body ?? {};

  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!existingAppointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  const validStatuses = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ] as const;

  const normalizedStatus: AppointmentStatus =
    status && typeof status === "string"
      ? validStatuses.includes(status.toUpperCase() as AppointmentStatus)
        ? (status.toUpperCase() as AppointmentStatus)
        : existingAppointment.status
      : existingAppointment.status;

  const appointment = await prisma.appointment.update({
    where: { id: Number(id) },
    data: {
      customerId: customerId !== undefined ? Number(customerId) : existingAppointment.customerId,
      serviceId: serviceId !== undefined ? Number(serviceId) : existingAppointment.serviceId,
      appointmentDate:
        appointmentDate !== undefined ? new Date(appointmentDate) : existingAppointment.appointmentDate,
      status: normalizedStatus,
      amount: amount !== undefined ? Number(amount) : existingAppointment.amount,
    },
    include: {
      customer: true,
      service: true,
    },
  });

  return res.json({
    success: true,
    message: "Appointment updated successfully",
    data: appointment,
  });
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  await prisma.appointment.delete({
    where: { id: Number(id) },
  });

  return res.json({
    success: true,
    message: "Appointment deleted successfully",
  });
});

export default router;
