import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  const customers = await prisma.customer.findMany({
    where: user.role === "SUPER_ADMIN" ? {} : { organizationId: user.organizationId ?? undefined },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    success: true,
    data: customers,
  });
});

router.get("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  if (user.role !== "SUPER_ADMIN" && customer.organizationId !== user.organizationId) {
    return res.status(403).json({
      success: false,
      message: "You can only access customers from your salon",
    });
  }

  return res.json({
    success: true,
    data: customer,
  });
});

router.post("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { name, phone, email, address } = req.body ?? {};

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name and phone are required",
    });
  }

  if (user.role !== "SUPER_ADMIN" && !user.organizationId) {
    return res.status(403).json({
      success: false,
      message: "Your account is not linked to any salon",
    });
  }

  const customer = await prisma.customer.create({
    data: {
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      address: address ? String(address).trim() : null,
      organizationId: user.role === "SUPER_ADMIN" ? null : user.organizationId,
      createdById: user.id,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
});

router.put("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { name, phone, email, address } = req.body ?? {};

  const existingCustomer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  });

  if (!existingCustomer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  if (user.role !== "SUPER_ADMIN" && existingCustomer.organizationId !== user.organizationId) {
    return res.status(403).json({
      success: false,
      message: "You can only update customers from your salon",
    });
  }

  const customer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      name: name ? String(name).trim() : existingCustomer.name,
      phone: phone ? String(phone).trim() : existingCustomer.phone,
      email: email === undefined ? existingCustomer.email : email ? String(email).trim() : null,
      address: address === undefined ? existingCustomer.address : address ? String(address).trim() : null,
    },
  });

  return res.json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  if (user.role !== "SUPER_ADMIN" && customer.organizationId !== user.organizationId) {
    return res.status(403).json({
      success: false,
      message: "You can only delete customers from your salon",
    });
  }

  await prisma.customer.delete({
    where: { id: Number(id) },
  });

  return res.json({
    success: true,
    message: "Customer deleted successfully",
  });
});

export default router;
