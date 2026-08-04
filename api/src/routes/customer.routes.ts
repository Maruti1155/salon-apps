import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (_req, res) => {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    success: true,
    data: customers,
  });
});

router.get("/:id", authMiddleware, async (req, res) => {
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

  return res.json({
    success: true,
    data: customer,
  });
});

router.post("/", authMiddleware, async (req, res) => {
  const { name, phone, email, address } = req.body ?? {};

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name and phone are required",
    });
  }

  const customer = await prisma.customer.create({
    data: {
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      address: address ? String(address).trim() : null,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
});

router.put("/:id", authMiddleware, async (req, res) => {
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

  await prisma.customer.delete({
    where: { id: Number(id) },
  });

  return res.json({
    success: true,
    message: "Customer deleted successfully",
  });
});

export default router;
